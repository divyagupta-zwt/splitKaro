const { Group, Member, sequelize, Expense, ExpenseSplit } = require('../models');

exports.addExpense= async(req, res)=>{
    const t= await sequelize.transaction();
    const {groupId}= req.params;

    const calculateSplit= async(amount)=>{
        const totalMembers= Members.count(id, {
            where: {group_id: groupId}
        });
        const members= await Members.findAll({
            where: {group_id: groupId}
        });
        try{
            switch(split_type){
                case 'equal':
                    const splitAmount= parseInt(amount) / totalMembers;
                    const extraPaisa= parseInt(amount) % totalMembers;
                    for (let m in members){
                        m.amount = splitAmount; 
                    }
                    if (extraPaisa !== 0){
                            members[0].amount += extraPaisa;
                        }
                    return splitAmount;
                case 'exact':
                    let total=0;
                    for(let m=0; m < members.length; m++){
                        const {exactAmount}= req.body;
                        for(let idx=0; idx <= m; idx++){
                            total += m[idx].exactAmount
                        }
                        const verifyTotal= m.exactAmount
                    }
                    
            }
        } catch(e){
            console.error({message: e.message});
        }
    }

    const {paidBy, amount, description, split_type, date, splits}= req.body;
    const expense= await Expense.create(groupId, paidBy, amount, description, split_type, date, {transaction: t});
    const expenseId= expense.id;
    await ExpenseSplit.create(expenseId, )
}

exports.getGroupExpenses= async(req, res, next)=>{
    try{
        const groupId= parseInt(req.params.id);
        const group= await Group.findByPk(groupId);
        if(!group) return res.status(400).json({message: 'Group not found'});

        const expenses= await Expense.findAll({
            where: {group_id: groupId},
            include: [
                {model: Member, as: 'payer'},
                {model: ExpenseSplit, as: 'splits', include: {model: Member, as: 'member'}}
            ],
            order: [['date', 'DESC'], ['createdAt', 'DESC']]
        });

        res.json(expenses);
    } catch(error){
        next(error);
    }
};

exports.deleteExpense= async(req, res, next)=>{
    const t= await sequelize.transaction();
    try{
        const expenseId= parseInt(req.params.id);
        const expense= await Expense.findByPk(expenseId, {transaction: t});
        if(!expense){
            await t.rollback();
            return res.status(400).json({message: 'Expense not found'});
        }

        await ExpenseSplit.destroy({
            where: {expense_id: expenseId},
            transaction: t
        });

        await expense.destroy({transaction: t});

        await t.commit();
        res.json({message: 'Expense deleted successfully'});
    }catch(error){
        next(error);
    }
};