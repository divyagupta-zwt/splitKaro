const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group.controller');
const expenseController = require('../controllers/expense.controllers');

// Group routes
router.post('/groups', groupController.createGroup);
router.get('/groups/:id', groupController.getGroup);

// Expense routes
router.post('/groups/:id/expenses', expenseController.addExpense);
router.get('/groups/:id/expenses', expenseController.getGroupExpenses);
router.delete('/expenses/:id', expenseController.deleteExpense);

// Balance route
router.get('/groups/:id/balances', expenseController.getGroupBalances);

module.exports = router;