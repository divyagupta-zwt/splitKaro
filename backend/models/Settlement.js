'use strict';

module.exports = (sequelize, DataTypes) => {
  const Settlement = sequelize.define('Settlement', {
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
    paid_to: {
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  }, {
    tableName: 'settlements',
    timestamps: true
  });

  Settlement.associate = function(models) {
    Settlement.belongsTo(models.Group, {
      foreignKey: 'group_id',
      as: 'group'
    });
    Settlement.belongsTo(models.Member, {
      foreignKey: 'paid_by',
      as: 'payer'
    });
    Settlement.belongsTo(models.Member, {
      foreignKey: 'paid_to',
      as: 'receiver'
    });
  };

  return Settlement;
};
