const { sequelize } = require("../models");

exports.calculateGroupBalances = async (groupId, options = {}) => {
  const [results] = await sequelize.query(`
    SELECT 
      m.id, 
      m.name,
      (
        COALESCE((SELECT SUM(amount) FROM expenses WHERE paid_by = m.id AND group_id = :groupId), 0)
        - COALESCE((SELECT SUM(amount_owed) FROM expense_splits es JOIN expenses e ON es.expense_id = e.id WHERE es.member_id = m.id AND e.group_id = :groupId), 0)
        + COALESCE((SELECT SUM(amount) FROM settlements WHERE paid_by = m.id AND group_id = :groupId), 0)
        - COALESCE((SELECT SUM(amount) FROM settlements WHERE paid_to = m.id AND group_id = :groupId), 0)
      ) AS balance
    FROM members m
    WHERE m.group_id = :groupId
  `, {
    replacements: { groupId },
    transaction: options.transaction
  });

  return results.map(r => ({
    id: r.id,
    member_id: r.id,
    name: r.name,
    balance: parseFloat(Number(r.balance).toFixed(2))
  }));
};
