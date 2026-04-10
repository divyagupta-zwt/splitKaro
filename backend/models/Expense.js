'use strict';

module.exports = (sequelize, DataTypes) => {
  const Expense = sequelize.define('Expense', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'groups',
        key: 'id'
      }
    },
    paid_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'members',
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: { args: [0.01], msg: 'Amount must be greater than 0' }
      }
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Expense description is required' }
      }
    },
    split_type: {
      type: DataTypes.ENUM('equal', 'exact', 'percentage'),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: { msg: 'Invalid date' }
      }
    }
  }, {
    tableName: 'expenses',
    timestamps: true
  });

  Expense.associate = function(models) {
    Expense.belongsTo(models.Group, {
      foreignKey: 'group_id',
      as: 'group'
    });
    Expense.belongsTo(models.Member, {
      foreignKey: 'paid_by',
      as: 'payer'
    });
    Expense.hasMany(models.ExpenseSplit, {
      foreignKey: 'expense_id',
      as: 'splits',
      onDelete: 'CASCADE'
    });
  };

  return Expense;
};
