const { Group, Member } = require("../models");

exports.validateSuggestSettlements = async (req, res, next) => {
    const { id } = req.params;
    if(!id || parseInt(id) <= 0) return res.status(400).json({ error: "Invalid group ID" });

    const group = await Group.findByPk(id);
    if(!group) return res.status(404).json({ error: "Group not found" });

    next();
}

exports.validateRecordSettlements = async (req, res, next) => {
    const { id } = req.params;
    if(!id || parseInt(id) <= 0) return res.status(400).json({ error: "Invalid group ID" });
    const {paidBy, paidTo, amount, date} = req.body;
    if(!paidBy || !paidTo || !amount || !date) return res.status(400).json({ error: "Missing required fields" });
    if(parseFloat(amount) <= 0) return res.status(400).json({ error: "Amount must be greater than zero" });

    const group = await Group.findByPk(id, { include: [{ model: Member, as: "members" }] });
    if(!group) return res.status(404).json({ error: "Group not found" });

    next();
}

exports.validateGetGroupSettlements= async (req, res, next)=>{
    const { id } = req.params;
    if(!id || parseInt(id) <= 0) return res.status(400).json({ error: "Invalid group ID" });

    next();
}