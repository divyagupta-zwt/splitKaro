const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group.controller');
const groupValidation= require('../validations/group.validation');
const expenseController = require('../controllers/expense.controllers');
const expenseValidation= require('../validations/expense.validation');
const settlementController= require('../controllers/settlement.controller');
const settlementValidation= require('../validations/settlement.validation');

// Group routes
router.get('/groups', groupValidation.validateFetchGroups, groupController.fetchGroups);
router.get('/groups/:id', groupValidation.validateGetGroup, groupController.getGroup);
router.post('/groups', groupValidation.validateCreateGroup, groupController.createGroup);

// Expense routes
router.get('/groups/:id/expenses', expenseValidation.validateGetGroupExpenses, expenseController.getGroupExpenses);
router.post('/groups/:id/expenses', expenseValidation.validateAddExpense, expenseController.addExpense);
router.delete('/expenses/:id', expenseValidation.validateDeleteExpense, expenseController.deleteExpense);

// Balance route
router.get('/groups/:id/balances', expenseValidation.validateGetGroupBalances, expenseController.getGroupBalances);

// Settlement route
router.get('/groups/:id/settlements/suggest', settlementValidation.validateSuggestSettlements, settlementController.suggestSettlements);
router.post('/groups/:id/settlements', settlementValidation.validateRecordSettlements, settlementController.recordSettlements);
router.get('/groups/:id/settlements', settlementValidation.validateGetGroupSettlements, settlementController.getGroupSettlements);

module.exports = router;