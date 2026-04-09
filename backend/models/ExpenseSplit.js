'use strict';

module.exports = (sequelize, DataTypes) => {
  const ExpenseSplit = sequelize.define('ExpenseSplit', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    expense_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'expenses',
        key: 'id'
      }
    },
    member_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'members',
        key: 'id'
      }
    },
    amount_owed: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: { args: [0], msg: 'Amount owed must be positive' }
      }
    }
  }, {
    tableName: 'expense_splits',
    timestamps: true
  });

  ExpenseSplit.associate = function(models) {
    ExpenseSplit.belongsTo(models.Expense, {
      foreignKey: 'expense_id',
      as: 'expense'
    });
    ExpenseSplit.belongsTo(models.Member, {
      foreignKey: 'member_id',
      as: 'member'
    });
  };

  return ExpenseSplit;
};
