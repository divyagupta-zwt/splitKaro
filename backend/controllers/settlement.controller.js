const { Group, Member, Settlement, Expense, ExpenseSplit, sequelize } = require('../models');

exports.suggestSettlements= async(req, res)=>{
    const groupId= req.params.id;
    const group= await Group.findByPk(groupId, {
        include: [{model: Member, as: 'members'}]
    });
    const expenses= await Expense.findAll({
        where: {group_id: groupId},
        include: [{model: ExpenseSplit, as: 'splits'}]
    });
    const settlements= await Settlement.findAll({
        where: {group_id: groupId} 
    });

    const balances= group.members.map((m)=>{
        const totalPaid = expenses.filter((e) => e.paid_by === m.id).reduce((s, e) => s + parseFloat(e.amount), 0);
        const totalOwed = expenses.reduce((s, e) => {
            const sp = e.splits.find((x) => x.member_id === m.id);
            return s + (sp ? parseFloat(sp.amount_owed) : 0);
        }, 0);

        const settlementsPaid= settlements.filter((s)=> s.paid_by === m.id).reduce((sum, s)=> sum + parseFloat(s.amount), 0);
        const settlementsReceived= settlements.filter((s)=> s.paid_to=== m.id).reduce((sum, s)=> sum + parseFloat(s.amount), 0);

        const netBalance= totalPaid - (totalOwed) + settlementsPaid - settlementsReceived;

        return {
            id: m.id,
            name: m.name,
            balance: parseFloat(netBalance.toFixed(2))
        };
    });

    const creditors= balances.filter((m)=> m.balance > 0).sort((a, b)=> b.balance - a.balance);
    const debitors= balances.filter((m)=> m.balance < 0).map(m=>({...m, balance: Math.abs(m.balance)})).sort((a,b)=> b.balance - a.balance);    

    let i=0, j=0;
    let suggestions= [];
    while(i < debitors.length && j < creditors.length){
        const d= debitors[i];
        const c= creditors[j];
        const amount= Math.min(d.balance, c.balance);

        if(amount > 0){
            suggestions.push({
                'from': {id: d.id, name: d.name},
                'to': {id: c.id, name: c.name},
                'amount': parseFloat(amount.toFixed(2))
            });
        }

        d.balance -= amount;
        c.balance -= amount;

        if(parseFloat((d.balance).toFixed(2)) <= 0) i++;
        if(parseFloat((c.balance).toFixed(2)) <= 0) j++;
    }

    res.json(suggestions);
};

exports.recordSettlements= async(req, res)=>{
    const t= await sequelize.transaction();
    const groupId= req.params.id;
    const {paid_by, paid_to, amount, date}= req.body;
    const group= await Group.findByPk(groupId, {
        include: [{model: Member, as: 'members'}],
        transaction: t
    });
    const payer= group.members.find((m)=> m.id=== paid_by);
    const receiver= group.members.find((m)=> m.id === paid_to);
    const expenses= await Expense.findAll({
        where: {group_id: groupId},
        include: [{model: ExpenseSplit, as: 'splits'}],
        transaction: t
    });
    const settlements= await Settlement.findAll({
        where: {group_id: groupId},
        transaction: t
    });
    const calculateBalance= (memberId)=> {
        const totalPaid= expenses.filter((e)=> e.paid_by=== memberId).reduce((s, e)=> s + parseFloat(e.amount), 0);
        const totalOwed= expenses.reduce((s, e)=>{
            const sp= e.splits.find((x)=>x.member_id=== memberId);
            return s + (sp ? parseFloat(sp.amount_owed) : 0);
        }, 0);

        const settlementsPaid= settlements.filter((s)=> s.paid_by=== memberId).reduce((sum, s)=> sum + parseFloat(s.amount), 0);
        const settlementsReceived= settlements.filter((s)=> s.paid_to === memberId).reduce((sum, s)=> sum + parseFloat(s.amount), 0);

        const netBalance= totalPaid - (totalOwed) + settlementsPaid - settlementsReceived;
        return netBalance;
    };

    const payerBalance= calculateBalance(payer.id);
    const receiverBalance= calculateBalance(receiver.id);

    if(payerBalance >= 0){
        await t.rollback();
        return res.status(400).json({message: 'Payer does not owe any money'});
    }
    if(receiverBalance <=0){
        await t.rollback();
        return res.status(400).json({message: 'Receiver is not owed any money'});
    }

    const maxPayerCanPay= Math.abs(payerBalance);
    const maxReceiverCanReceive= receiverBalance;
    // const maxPossible= Math.min(maxPayerCanPay, maxReceiverCanReceive);

    if(parseFloat(amount) > maxPayerCanPay.toFixed(2)){
        await t.rollback();
        return res.status(400).json({message: `Cannot pay more than what payer owes: ${maxPayerCanPay.toFixed(2)}`});
    }
    if(parseFloat(amount) > maxReceiverCanReceive.toFixed(2)){
        await t.rollback();
        return res.status(400).json({message: `Cannot receive more than what is owed: ${maxReceiverCanReceive.toFixed(2)}`});
    }

    const settlement= await Settlement.create({
        group_id: groupId,
        paid_by: payer.id,
        paid_to: receiver.id,
        amount,
        date
    }, {transaction: t});

    await t.commit();
    const createdSettlement= await Settlement.findByPk(settlement.id, {
        include: [{model: Member, as: 'payer'}, {model: Member, as: 'receiver'}]
    });
    res.status(201).json(createdSettlement);
};

exports.getGroupSettlements = async (req, res) => {
    const groupId = req.params.id;

    const settlements = await Settlement.findAll({
      where: { group_id: groupId },
      include: [
        { model: Member, as: 'payer' },
        { model: Member, as: 'receiver' }
      ],
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json(settlements);
};