const { Group, Expense, Member, Settlement } = require("../models");

exports.validateAddExpense = async(req, res, next) => {
  const { description, amount, date, paidBy, splitType, splits } = req.body;
  if (
    !description ||
    !amount ||
    amount <= 0 ||
    !date ||
    !paidBy ||
    !splitType
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }
  if (!["equal", "exact", "percentage"].includes(splitType)) {
    return res.status(400).json({ error: "Invalid split type" });
  }
  const group= await Group.findByPk(req.params.id, {include: [{ model: Member, as: "members" }] });
  if(!group) return res.status(404).json({ error: "Group not found" });
  const members= group.members;
  if(members.length === 0) return res.status(400).json({ error: "Group has no members" });
  if(!members.some(m=> m.id === Number(paidBy))) return res.status(400).json({ error: "Payer must be a group member" });
  next();
};

exports.validateGetGroupExpenses = async (req, res, next) => {
  if (!req.params.id || parseInt(req.params.id) <= 0)
    return res
      .status(400)
      .json({ error: "Group ID must be a positive integer" });


  next();
};

exports.validateDeleteExpense = async (req, res, next) => {
  if (!req.params.id || parseInt(req.params.id) <= 0)
    return res
      .status(400)
      .json({ error: "Expense ID must be a positive integer" });

  const expense = await Expense.findByPk(req.params.id);
  if (!expense) return res.status(404).json({ error: "Expense not found" });
  next();
};

exports.validateGetGroupBalances = async(req, res, next) => {
  if (!req.params.id || parseInt(req.params.id) <= 0)
    return res
      .status(400)
      .json({ error: "Group ID must be a positive integer" });

  const group = await Group.findByPk(req.params.id);
  if (!group) return res.status(404).json({ error: "Group not found" });


  next();
};