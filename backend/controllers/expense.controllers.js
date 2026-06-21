const {
  Group,
  Member,
  sequelize,
  Expense,
  ExpenseSplit,
} = require("../models");
const { calculateGroupBalances } = require("../utils/balanceCalculator");

const abort = async (t, res, status, msg) => {
  await t.rollback();
  return res.status(status).json({ error: msg });
};

exports.addExpense = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const groupId = req.params.id;
    const { paidBy, amount, description, splitType, date, splits } = req.body;

    const group = await Group.findByPk(groupId, {
      include: { model: Member, as: "members" },
      transaction: t,
    });

    const members = group.members;

    const expense = await Expense.create(
      { group_id: groupId, paid_by: paidBy, amount, description, split_type: splitType, date },
      { transaction: t },
    );

    let splitRecords = [];

    // EQUAL
    if (splitType === "equal") {
      const totalCents = Math.round(amount * 100);
      const baseShareCents = Math.floor(totalCents / members.length);
      let remainderCents = totalCents % members.length;

      splitRecords = members.map((m) => {
        let memberCents = baseShareCents;
        if (remainderCents > 0) {
          memberCents += 1;
          remainderCents -= 1;
        }
        return {
          expense_id: expense.id,
          member_id: m.id,
          amount_owed: memberCents / 100,
        };
      });
    }

    // EXACT
    if (splitType === "exact") {
      const totalCents = Object.values(splits || {}).reduce(
        (sum, val) => sum + Math.round(parseFloat(val) * 100),
        0
      );
      if (totalCents !== Math.round(amount * 100))
        return abort(t, res, 400, "Invalid splits");

      splitRecords = Object.entries(splits).map(([id, val]) => ({
        expense_id: expense.id,
        member_id: parseInt(id, 10),
        amount_owed: Math.round(parseFloat(val) * 100) / 100,
      }));
    }

    // PERCENTAGE
    if (splitType === "percentage") {
      const totalPercentCents = Object.values(splits || {}).reduce(
        (sum, p) => sum + Math.round(parseFloat(p) * 100),
        0
      );
      if (totalPercentCents !== 10000)
        return abort(t, res, 400, "Percent must be 100");

      const totalCents = Math.round(amount * 100);
      let distributedCents = 0;

      splitRecords = Object.entries(splits).map(([id, p]) => {
        const shareCents = Math.round((parseFloat(p) / 100) * totalCents);
        distributedCents += shareCents;
        return {
          expense_id: expense.id,
          member_id: parseInt(id, 10),
          amount_owed: shareCents / 100,
        };
      });

      const diffCents = totalCents - distributedCents;
      if (diffCents !== 0 && splitRecords.length > 0) {
        splitRecords[0].amount_owed = (Math.round(splitRecords[0].amount_owed * 100) + diffCents) / 100;
      }
    }

    await ExpenseSplit.bulkCreate(splitRecords, { transaction: t });
    await t.commit();

    res.status(201).json({ message: "Expense added", expense_id: expense.id });
  } catch (e) {
    if (t && !t.finished) await t.rollback();
    next(e);
  }
};

exports.getGroupExpenses = async (req, res, next) => {
  try {
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
  } catch (e) {
    next(e);
  }
};

exports.deleteExpense = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    await Expense.destroy({ where: { id: req.params.id }, transaction: t });
    await t.commit();

    res.json({ message: "Deleted" });
  } catch (e) {
    if (t && !t.finished) await t.rollback();
    next(e);
  }
};

exports.getGroupBalances = async (req, res, next) => {
  try {
    const balances = await calculateGroupBalances(req.params.id);

    res.json(balances);
  } catch (e) {
    next(e);
  }
};
