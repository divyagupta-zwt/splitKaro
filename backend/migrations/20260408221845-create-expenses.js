'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('expenses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      group_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'groups',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      paid_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'members',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false
      },
      split_type: {
        type: Sequelize.ENUM('equal', 'exact', 'percentage'),
        allowNull: false
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('expenses', ['paid_by'], {
      name: 'idx_expenses_paid_by'
    });

    await queryInterface.addIndex('expenses', ['group_id'], {
      name: 'idx_expenses_group_id'
    });

    await queryInterface.addIndex('expenses', ['id'], {
      unique: true,
      name: 'idx_expenses_id'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('expenses');
    await queryInterface.removeIndex('expenses', 'idx_expenses_paid_by');
    await queryInterface.removeIndex('expenses', 'idx_expenses_group_id');
    await queryInterface.removeIndex('expenses', 'idx_expenses_id');
  }
};
