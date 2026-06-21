const {
  Group,
  Member,
  Settlement,
  sequelize,
} = require("../models");
const { calculateGroupBalances } = require("../utils/balanceCalculator");

const abort = async (t, res, status, msg) => {
  await t.rollback();
  return res.status(status).json({ error: msg });
};

exports.suggestSettlements = async (req, res, next) => {
  try {
    const groupId = req.params.id;
    const balances = await calculateGroupBalances(groupId);

    const creditors = balances
      .filter((m) => m.balance > 0)
      .map((m) => ({ ...m, balanceCents: Math.round(m.balance * 100) }))
      .sort((a, b) => b.balanceCents - a.balanceCents);
    const debitors = balances
      .filter((m) => m.balance < 0)
      .map((m) => ({ ...m, balanceCents: Math.round(Math.abs(m.balance) * 100) }))
      .sort((a, b) => b.balanceCents - a.balanceCents);

    let i = 0,
      j = 0;
    let suggestions = [];
    while (i < debitors.length && j < creditors.length) {
      const d = debitors[i];
      const c = creditors[j];
      const amountCents = Math.min(d.balanceCents, c.balanceCents);

      if (amountCents > 0) {
        suggestions.push({
          from: { id: d.id, name: d.name },
          to: { id: c.id, name: c.name },
          amount: amountCents / 100,
        });
      }

      d.balanceCents -= amountCents;
      c.balanceCents -= amountCents;

      if (d.balanceCents <= 0) i++;
      if (c.balanceCents <= 0) j++;
    }

    res.json(suggestions);
  } catch (e) {
    next(e);
  }
};

exports.recordSettlements = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const groupId = req.params.id;
    const { paidBy, paidTo, amount, date } = req.body;

    const group = await Group.findByPk(groupId, {
      include: [{ model: Member, as: "members" }],
      transaction: t,
    });

    const payer = group.members.find((m) => m.id === Number(paidBy));
    const receiver = group.members.find((m) => m.id === Number(paidTo));

    if (!payer || !receiver) {
      return abort(t, res, 400, "Payer or receiver not found in group");
    }

    const balances = await calculateGroupBalances(groupId, { transaction: t });
    const payerBalance = balances.find(b => b.id === Number(paidBy))?.balance || 0;
    const receiverBalance = balances.find(b => b.id === Number(paidTo))?.balance || 0;

    if (payerBalance >= 0) return abort(t, res, 400, "Payer does not owe any money");
    if (receiverBalance <= 0) return abort(t, res, 400, "Receiver is not owed any money");

    const amountCents = Math.round(parseFloat(amount) * 100);
    const maxPayerCanPayCents = Math.round(Math.abs(payerBalance) * 100);
    const maxReceiverCanReceiveCents = Math.round(receiverBalance * 100);

    if (amountCents > maxPayerCanPayCents) {
      return abort(t, res, 400, `Cannot pay more than what is owed: ${(maxPayerCanPayCents / 100).toFixed(2)}`);
    }
    if (amountCents > maxReceiverCanReceiveCents) {
      return abort(t, res, 400, `Cannot receive more than what is owed: ${(maxReceiverCanReceiveCents / 100).toFixed(2)}`);
    }

    const settlement = await Settlement.create(
      {
        group_id: groupId,
        paid_by: payer.id,
        paid_to: receiver.id,
        amount,
        date,
      },
      { transaction: t },
    );

    await t.commit();
    const createdSettlement = await Settlement.findByPk(settlement.id, {
      include: [
        { model: Member, as: "payer" },
        { model: Member, as: "receiver" },
      ],
    });

    res.status(201).json(createdSettlement);
  } catch (e) {
    if (t && !t.finished) await t.rollback();
    next(e);
  }
};

exports.getGroupSettlements = async (req, res, next) => {
  try {
    const groupId = req.params.id;

    const settlements = await Settlement.findAll({
      where: { group_id: groupId },
      include: [
        { model: Member, as: "payer" },
        { model: Member, as: "receiver" },
      ],
      order: [
        ["date", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    res.json(settlements);
  } catch (e) {
    next(e);
  }
};
