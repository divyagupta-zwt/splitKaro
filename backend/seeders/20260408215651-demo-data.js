'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('groups', [{
      id: 1,
      name: 'Weekend Goa Trip',
      description: 'Annual friends trip',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    await queryInterface.bulkInsert('members', [
      { id: 1, group_id: 1, name: 'Amit', email: 'amit@email.com', phone: '9876543210', createdAt: new Date(), updatedAt: new Date() },
      { id: 2, group_id: 1, name: 'Priya', email: 'priya@email.com', phone: '9876543211', createdAt: new Date(), updatedAt: new Date() },
      { id: 3, group_id: 1, name: 'Rahul', email: 'rahul@email.com', phone: '9876543212', createdAt: new Date(), updatedAt: new Date() },
      { id: 4, group_id: 1, name: 'Sneha', email: 'sneha@email.com', phone: '9876543213', createdAt: new Date(), updatedAt: new Date() }
    ]);

    await queryInterface.bulkInsert('expenses', [{
      id: 1,
      group_id: 1,
      paid_by: 1,
      amount: 6000.00,
      description: 'Hotel Room(2 Nights)',
      split_type: 'equal',
      date: '2026-04-05',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    await queryInterface.bulkInsert('expense_splits', [
      { expense_id: 1, member_id: 1, amount_owed: 1500.00, createdAt: new Date(), updatedAt: new Date() },
      { expense_id: 1, member_id: 2, amount_owed: 1500.00, createdAt: new Date(), updatedAt: new Date() },
      { expense_id: 1, member_id: 3, amount_owed: 1500.00, createdAt: new Date(), updatedAt: new Date() },
      { expense_id: 1, member_id: 4, amount_owed: 1500.00, createdAt: new Date(), updatedAt: new Date() }
    ]);

    await queryInterface.bulkInsert('expenses', [{
      id: 3,
      group_id: 1,
      paid_by: 3,
      amount: 3650.00,
      description: 'Scuba Diving',
      split_type: 'exact',
      date: '2026-04-06',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
    await queryInterface.bulkInsert('expense_splits', [
      { expense_id: 3, member_id: 1, amount_owed: 1100.00, createdAt: new Date(), updatedAt: new Date() },
      { expense_id: 3, member_id: 2, amount_owed: 0.00, createdAt: new Date(), updatedAt: new Date() },
      { expense_id: 3, member_id: 3, amount_owed: 1450.00, createdAt: new Date(), updatedAt: new Date() },
      { expense_id: 3, member_id: 4, amount_owed: 1100.00, createdAt: new Date(), updatedAt: new Date() }
    ]);

    await queryInterface.bulkInsert('expenses', [{
      id: 4,
      group_id: 1,
      paid_by: 1,
      amount: 1200.00,
      description: 'Cab to Airport',
      split_type: 'percentage',
      date: '2026-04-06',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    await queryInterface.bulkInsert('expense_splits', [
      { expense_id: 4, member_id: 1, amount_owed: 360.00, createdAt: new Date(), updatedAt: new Date() },
      { expense_id: 4, member_id: 2, amount_owed: 360.00, createdAt: new Date(), updatedAt: new Date() },
      { expense_id: 4, member_id: 3, amount_owed: 300.00, createdAt: new Date(), updatedAt: new Date() },
      { expense_id: 4, member_id: 4, amount_owed: 180.00, createdAt: new Date(), updatedAt: new Date() }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('expense_splits', null, {});
    await queryInterface.bulkDelete('expenses', null, {});
    await queryInterface.bulkDelete('members', null, {});
    await queryInterface.bulkDelete('groups', null, {});
  }
};
