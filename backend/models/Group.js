'use strict';

module.exports = (sequelize, DataTypes) => {
  const Group = sequelize.define('Group', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Group name is required' },
        min: {args: [3], msg: 'Name must be atleast 3 characters'}
      }
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, {
    tableName: 'groups',
    timestamps: true
  });

  Group.associate = function(models) {
    Group.hasMany(models.Member, {
      foreignKey: 'group_id',
      as: 'members',
      onDelete: 'CASCADE'
    });
    Group.hasMany(models.Expense, {
      foreignKey: 'group_id',
      as: 'expenses',
      onDelete: 'CASCADE'
    });
  };

  return Group;
};
