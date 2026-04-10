const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group.controller');
const expenseController = require('../controllers/expense.controllers');
const settlementController= require('../controllers/settlement.controller');

// Group routes
router.get('/groups', groupController.fetchGroups);
router.get('/groups/:id', groupController.getGroup);
router.post('/groups', groupController.createGroup);

// Expense routes
router.post('/groups/:id/expenses', expenseController.addExpense);
router.get('/groups/:id/expenses', expenseController.getGroupExpenses);
router.delete('/expenses/:id', expenseController.deleteExpense);

// Balance route
router.get('/groups/:id/balances', expenseController.getGroupBalances);

// Settlement route
// router.get('/groups/:id/settlements/suggest', settlementController);
// router.post('/groups/:id/settlements', settlementController);
// router.get('/groups/:id/settlements', settlementController);

module.exports = router;