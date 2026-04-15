const { Group, Expense, Member, Settlement } = require("../models");

exports.validateSuggestSettlements = async (req, res, next) => {
    const { id } = req.params;
    if(!id || parseInt(id) <= 0) return res.status(400).json({ message: "Invalid group ID" });

    const group = Group.findByPk(id);
    if(!group) return res.status(404).json({ message: "Group not found" });

    const expenses = await Expense.findAll({ where: { group_id: req.params.id } });
    if (!expenses || expenses.length === 0) return res.status(404).json({ error: "No expenses found for this group" });

    const settlements = await Settlement.findAll({ where: { group_id: req.params.id } });
    if(!settlements || settlements.length === 0) return res.status(404).json({ error: "No settlements found for this group" });
    next();
}

exports.validateRecordSettlements = async (req, res, next) => {
    const { id } = req.params;
    if(!id || parseInt(id) <= 0) return res.status(400).json({ message: "Invalid group ID" });
    const {paid_by, paid_to, amount, date} = req.body;
    if(!paid_by || !paid_to || !amount || !date) return res.status(400).json({ message: "Missing required fields" });
    if(parseFloat(amount) <= 0) return res.status(400).json({ message: "Amount must be greater than zero" });

    const group = await Group.findByPk(id, { include: [{ model: Member, as: "members" }] });
    if(!group) return res.status(404).json({ message: "Group not found" });

    const expenses = await Expense.findAll({ where: { group_id: id } });
    if (!expenses || expenses.length === 0) return res.status(404).json({ error: "No expenses found for this group" });

    const settlements = await Settlement.findAll({ where: { group_id: id } });
    if(!settlements || settlements.length === 0) return res.status(404).json({ error: "No settlements found for this group" });
    next();
}

exports.validateGetGroupSettlements= async (req, res, next)=>{
    const { id } = req.params;
    if(!id || parseInt(id) <= 0) return res.status(400).json({ message: "Invalid group ID" });

    const settlements= await Settlement.findAll({ where: { group_id: id } });
    if(!settlements || settlements.length === 0) return res.status(404).json({ message: "No settlements found for this group" });
    next();
}