const {
  Group,
  Member,
  sequelize,
  Expense,
  ExpenseSplit,
} = require("../models");

exports.addExpense = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const groupId = req.params.id;
    const { paid_by, amount, description, split_type, date, splits } = req.body;

    const group = await Group.findByPk(groupId, {
      include: [{ model: Member, as: "members" }],
      transaction: t,
    });
    if (!group) {
      await t.rollback();
      return res.status(404).json({ error: "Group not found" });
    }

    const payer = group.members.find((m) => m.id === paid_by);
    if (!payer) {
      await t.rollback();
      return res
        .status(400)
        .json({ error: "Payer must belong to this group" });
    }

    if (!amount || amount <= 0) {
      await t.rollback();
      return res.status(400).json({ error: "Amount must be greater than 0" });
    }

    if (!description) {
      await t.rollback();
      return res.status(400).json({ error: "Description is required" });
    }

    if (!["equal", "exact", "percentage"].includes(split_type)) {
      await t.rollback();
      return res
        .status(400)
        .json({ error: "Split type must be equal, exact, or percentage" });
    }

    if (!date) {
      await t.rollback();
      return res.status(400).json({ error: "Date is required" });
    }

    const expense = await Expense.create(
      {
        group_id: groupId,
        paid_by,
        amount,
        description,
        split_type,
        date,
      },
      { transaction: t },
    );

    let splitRecords = [];
    const members = group.members;

    const divideAmount=(totalAmount, totalMembers)=> {
      const total = Math.round(totalAmount * 100);
      const baseAmount = Math.floor(total / totalMembers);
      const remainder = total - baseAmount * totalMembers;

      const amounts = [];
      for (let i = 0; i < totalMembers; i++) {
        if (i < remainder) {
          amounts.push((baseAmount + 1) / 100);
        } else {
          amounts.push(baseAmount / 100);
        }
      }
      return amounts;
    };

    if (split_type === "equal") {
      const amounts = divideAmount(parseFloat(amount), members.length);
      splitRecords = members.map((member, idx) => ({
        expense_id: expense.id,
        member_id: member.id,
        amount_owed: amounts[idx],
      }));
    } else if (split_type === "exact") {
      if (!splits || typeof splits !== "object") {
        await t.rollback();
        return res.status(400).json({ error: "Splits object is required for exact split type" });
      }

      const splitValues = Object.values(splits).map((v) => parseFloat(v));
      const splitSum = Math.round(splitValues.reduce((a, b) => a + b, 0) * 100) / 100;
      const totalAmount = Math.round(parseFloat(amount) * 100) / 100;

      if (splitSum !== totalAmount) {
        await t.rollback();
        return res.status(400).json({
          error: `Split amounts are not equal to total amount`,
        });
      }

      for (const [memberId, amountOwed] of Object.entries(splits)) {
        const member = members.find((m) => m.id === memberId);
        if (!member) {
          await t.rollback();
          return res.status(400).json({
            error: `Member ${memberId} is not in this group`,
          });
        }
        splitRecords.push({
          expense_id: expense.id,
          member_id: memberId,
          amount_owed: parseFloat(amountOwed),
        });
      }
    } else if (split_type === "percentage") {
      if (!splits || typeof splits !== "object") {
        await t.rollback();
        return res.status(400).json({
            error: "Splits object is required for percentage split type",
        });
      }

      const percentValues = Object.values(splits).map((v) => parseFloat(v));
      const percentSum = Math.round(percentValues.reduce((a, b) => a + b, 0) * 100) / 100;

      if (percentSum !== 100) {
        await t.rollback();
        return res.status(400).json({
          error: `Percentages sum is not equal to 100%`,
        });
      }

      for (const memberId of Object.keys(splits)) {
        const member = members.find((m) => m.id === memberId);
        if (!member) {
          await t.rollback();
          return res.status(400).json({
            error: `Member ${memberId} is not in this group`,
          });
        }
      }

      const totalPercent = Math.round(parseFloat(amount) * 100);
      const entries = Object.entries(splits);
      let allocatedPercent = 0;

      const calculatedAmounts = entries.map(([memberId, percent], idx) => {
        let amountShare;
        if (idx === entries.length - 1) {
          amountShare = totalPercent - allocatedPercent;
        } else {
          amountShare = Math.round((parseFloat(percent) / 100) * totalPercent) / 100;
          allocatedPercent += amountShare;
        }
        return {
          memberId,
          amountOwed: amountShare,
        };
      });

      splitRecords = calculatedAmounts.map((item) => ({
        expense_id: expense.id,
        member_id: item.memberId,
        amount_owed: item.amountOwed,
      }));
    }

    await ExpenseSplit.bulkCreate(splitRecords, { transaction: t });

    await t.commit();

    const createdExpense = await Expense.findByPk(expense.id, {
      include: [
        { model: Member, as: "payer" },
        {
          model: ExpenseSplit,
          as: "splits",
          include: [{ model: Member, as: "member" }],
        },
      ],
    });

    res.status(201).json(createdExpense);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

exports.getGroupExpenses = async (req, res, next) => {
  try {
    const groupId = (req.params.id);
    const group = await Group.findByPk(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const expenses = await Expense.findAll({
      where: { group_id: groupId },
      include: [
        { model: Member, as: "payer" },
        {
          model: ExpenseSplit,
          as: "splits",
          include: { model: Member, as: "member" },
        },
      ],
      order: [
        ["date", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    res.json(expenses);
  } catch (error) {
    next(error);
  }
};

exports.deleteExpense = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const expenseId = req.params.id;
    const expense = await Expense.findByPk(expenseId, { transaction: t });
    if (!expense) {
      await t.rollback();
      return res.status(404).json({ message: "Expense not found" });
    }

    await ExpenseSplit.destroy({
      where: { expense_id: expenseId },
      transaction: t,
    });

    await expense.destroy({ transaction: t });

    await t.commit();
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    next(error);
  }
};

exports.getGroupBalances = async (req, res, next) => {
  try {
    const groupId = req.params.id;
    const group = await Group.findByPk(groupId, {
      include: { model: Member, as: "members" },
    });
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const expenses = await Expense.findAll({
      where: { group_id: groupId },
      include: { model: ExpenseSplit, as: "splits" },
    });

    const balances = group.members.map((member) => {
      const totalPaid = expenses
        .filter((e) => e.paid_by === member.id)
        .reduce((sum, e) => sum + parseFloat(e.amount), 0);
      const totalOwed = expenses.reduce((sum, e) => {
        const split = e.splits.find((s) => s.member_id === member.id);
        return sum + (split ? parseFloat(split.amount_owed) : 0);
      }, 0);

      return {
        member_id: member.id,
        name: member.name,
        balance: Math.round((totalPaid - totalOwed) * 100) / 100,
      };
    });

    res.json(balances);
  } catch (error) {
    next(error);
  }
};