const { Group, Member, sequelize, Expense, ExpenseSplit } = require('../models');

exports.addExpense= async(req, res)=>{
    const t= await sequelize.transaction();
    const groupId= parseInt(req.params.id);

    // const calculateSplit= async(amount)=>{
    //     const totalMembers= Member.count(id, {
    //         where: {group_id: groupId}
    //     });
    //     const members= await Member.findAll({
    //         where: {group_id: groupId}
    //     });
    //     try{
    //         switch(split_type){
    //             case 'equal':
    //                 const splitAmount= parseFloat(amount) / totalMembers;
    //                 const extraPaisa= parseFloat(amount) % totalMembers;
    //                 for (let m in members){
    //                     m.amount = splitAmount; 
    //                 }
    //                 if (extraPaisa !== 0){
    //                         members[0].amount += extraPaisa;
    //                     }
    //                 return splitAmount;
                    
    //         }
    //     } catch(e){
    //         console.error({message: e.message});
    //     }
    // }

    const {paidBy, amount, description, split_type, date, splits}= req.body;
    const expense= await Expense.create(groupId, paidBy, amount, description, split_type, date, {transaction: t});
    const expenseId= expense.id;
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

exports.getGroupBalances= async(req, res, next)=>{
    try{
        const groupId= parseInt(req.params.id);
        const group= await Group.findByPk(groupId, {
            include: {model: Member, as: 'members'}
        });
        if(!group){
            return res.status(400).json({message: 'Group not found'});
        }

        const expenses= await Expense.findAll({
            where: {group_id: groupId},
            include: {model: ExpenseSplit, as: 'splits'}
        });

        const balances= group.members.map(member=>{
            const totalPaid= expenses.filter((e)=> e.paid_by === member.id).reduce((sum, e)=> sum + parseFloat(e.amount), 0);
            const totalOwed= expenses.reduce((sum, e)=>{
                const split= e.splits.find(s=> s.member_id === member.id);
                return sum + (split ? parseFloat(split.amount_owed) : 0);
            }, 0);
            
            return {
                member_id: member.id,
                name: member.name,
                balance: Math.round((totalPaid - totalOwed) * 100) / 100,
            };
        });

        res.json(balances);
    }catch(error){
        next(error);
    }
};