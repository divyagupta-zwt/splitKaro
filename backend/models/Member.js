'use strict';

module.exports = (sequelize, DataTypes) => {
  const Member = sequelize.define('Member', {
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Member name is required' }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: { msg: 'Invalid email address' },
        notEmpty: { msg: 'Email is required' }
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'members',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['group_id', 'email'],
        name: 'unique_email_per_group'
      }
    ]
  });

  Member.associate = function(models) {
    Member.belongsTo(models.Group, {
      foreignKey: 'group_id',
      as: 'group'
    });
    Member.hasMany(models.Expense, {
      foreignKey: 'paid_by',
      as: 'expensesPaid'
    });
    Member.hasMany(models.ExpenseSplit, {
      foreignKey: 'member_id',
      as: 'splits'
    });
  };

  return Member;
};
