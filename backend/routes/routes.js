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
router.get('/groups/:id/expenses', expenseController.getGroupExpenses);
router.post('/groups/:id/expenses', expenseController.addExpense);
router.delete('/expenses/:id', expenseController.deleteExpense);

// Balance route
router.get('/groups/:id/balances', expenseController.getGroupBalances);

// Settlement route
router.get('/groups/:id/settlements/suggest', settlementController.suggestSettlements);
router.post('/groups/:id/settlements', settlementController.recordSettlements);
router.get('/groups/:id/settlements', settlementController.getGroupSettlements);

module.exports = router;