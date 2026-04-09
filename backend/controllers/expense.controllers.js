const {Group, Member, sequelize, Expense, ExpenseSplit} = require("../models");

const abort = async (t, res, status, msg) => {
  await t.rollback();
  return res.status(status).json({ error: msg });
};

exports.addExpense = async (req, res) => {
  const t = await sequelize.transaction();
  const groupId = req.params.id;
  const { paid_by, amount, description, split_type, date, splits } = req.body;

  const group = await Group.findByPk(groupId, {
    include: { model: Member, as: "members" },
    transaction: t,
  });
  if (!group) return abort(t, res, 404, "Group not found");

  const members = group.members;
  if (!members.some((m) => m.id === paid_by))
    return abort(t, res, 400, "Invalid payer");

  if (!amount || amount <= 0 || !description || !date)
    return abort(t, res, 400, "Missing required fields");

  if (!["equal", "exact", "percentage"].includes(split_type))
    return abort(t, res, 400, "Invalid split type");

  const expense = await Expense.create(
    { group_id: groupId, paid_by, amount, description, split_type, date },
    { transaction: t },
  );

  let splitRecords = [];

  // EQUAL
  if (split_type === "equal") {
    const share = parseFloat((amount / members.length).toFixed(2));
    splitRecords = members.map((m) => ({
      expense_id: expense.id,
      member_id: m.id,
      amount_owed: share,
    }));
  }

  // EXACT
  if (split_type === "exact") {
    const total = Object.values(splits || {}).reduce((a, b) => a + parseFloat(b), 0);
    if (parseFloat(total.toFixed(2)) !== parseFloat(amount))
      return abort(t, res, 400, "Invalid splits");

    splitRecords = Object.entries(splits).map(([id, val]) => ({
      expense_id: expense.id,
      member_id: id,
      amount_owed: parseFloat(val),
    }));
  }

  // PERCENTAGE
  if (split_type === "percentage") {
    const totalPercent = Object.values(splits || {}).reduce(
      (a, b) => a + parseFloat(b), 0,
    );
    if (parseFloat(totalPercent) !== 100) return abort(t, res, 400, "Percent must be 100");

    splitRecords = Object.entries(splits).map(([id, p]) => ({
      expense_id: expense.id,
      member_id: id,
      amount_owed: parseFloat(((p / 100) * amount).toFixed(2)),
    }));
  }

  await ExpenseSplit.bulkCreate(splitRecords, { transaction: t });
  await t.commit();

  res.status(201).json({ message: "Expense added", expense_id: expense.id });
};

exports.getGroupExpenses = async (req, res) => {
  const expenses = await Expense.findAll({
    where: { group_id: req.params.id },
    include: [
      { model: Member, as: "payer" },
      {
        model: ExpenseSplit,
        as: "splits",
        include: { model: Member, as: "member" },
      },
    ],
    order: [["date", "DESC"]],
  });
  res.json(expenses);
};

exports.deleteExpense = async (req, res) => {
  await ExpenseSplit.destroy({
    where: { expense_id: req.params.id }
  });

  await Expense.destroy({ where: { id: req.params.id }});

  res.json({ message: "Deleted" });
};

exports.getGroupBalances = async (req, res) => {
  const group = await Group.findByPk(req.params.id, {
    include: { model: Member, as: "members" },
  });

  const expenses = await Expense.findAll({
    where: { group_id: req.params.id },
    include: { model: ExpenseSplit, as: "splits" },
  });

  const balances = group.members.map((m) => {
    const paid = expenses.filter((e) => e.paid_by === m.id).reduce((s, e) => s + parseFloat(e.amount), 0);

    const owed = expenses.reduce((s, e) => {
      const sp = e.splits.find((x) => x.member_id === m.id);
      return s + (sp ? parseFloat(sp.amount_owed) : 0);
    }, 0);

    return {
      member_id: m.id,
      name: m.name,
      balance: parseFloat((paid - owed).toFixed(2)),
    };
  });

  res.json(balances);
};
