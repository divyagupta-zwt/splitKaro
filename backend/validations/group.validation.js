const { Group } = require("../models");

exports.validateCreateGroup= (req, res, next)=>{
    if(!req.body.name) return res.status(400).json({error: 'Group name is required'});
    if(!req.body.members || !Array.isArray(req.body.members) || req.body.members.length === 0){
        return res.status(400).json({error: 'At least one member is required'});
    }
    next();
}

exports.validateGetGroup= async(req, res, next)=>{
    if(!req.params.id || parseInt(req.params.id) <= 0) return res.status(400).json({error: 'Group ID must be a positive integer'});
    const group= await Group.findByPk(req.params.id);
    if(!group) return res.status(404).json({error: 'Group not found!'});
    next();
}

exports.validateFetchGroups= async(req, res, next)=>{
    const groups= await Group.findAll();
    if(!groups || groups.length===0) return res.status(404).json({error: 'No groups found!'});
    next();
}