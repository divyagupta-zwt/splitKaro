const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group.controller');
const groupValidation = require('../validations/group.validation');
const expenseController = require('../controllers/expense.controllers');
const expenseValidation = require('../validations/expense.validation');
const settlementController = require('../controllers/settlement.controller');
const settlementValidation = require('../validations/settlement.validation');
const authController = require('../controllers/auth.controller');
const authValidation = require('../validations/auth.validation');
const { authenticateJWT, authorizeGroup } = require('../middleware/auth');

// Auth routes
router.post('/auth/signup', authValidation.validateSignup, authController.signup);
router.post('/auth/login', authValidation.validateLogin, authController.login);
router.get('/auth/me', authenticateJWT, authController.me);

// Group routes
router.get('/groups', authenticateJWT, groupValidation.validateFetchGroups, groupController.fetchGroups);
router.get('/groups/:id', authenticateJWT, authorizeGroup, groupValidation.validateGetGroup, groupController.getGroup);
router.post('/groups', authenticateJWT, groupValidation.validateCreateGroup, groupController.createGroup);

// Expense routes
router.get('/groups/:id/expenses', authenticateJWT, authorizeGroup, expenseValidation.validateGetGroupExpenses, expenseController.getGroupExpenses);
router.post('/groups/:id/expenses', authenticateJWT, authorizeGroup, expenseValidation.validateAddExpense, expenseController.addExpense);
router.delete('/expenses/:id', authenticateJWT, expenseValidation.validateDeleteExpense, expenseController.deleteExpense);

// Balance route
router.get('/groups/:id/balances', authenticateJWT, authorizeGroup, expenseValidation.validateGetGroupBalances, expenseController.getGroupBalances);

// Settlement routes
router.get('/groups/:id/settlements/suggest', authenticateJWT, authorizeGroup, settlementValidation.validateSuggestSettlements, settlementController.suggestSettlements);
router.post('/groups/:id/settlements', authenticateJWT, authorizeGroup, settlementValidation.validateRecordSettlements, settlementController.recordSettlements);
router.get('/groups/:id/settlements', authenticateJWT, authorizeGroup, settlementValidation.validateGetGroupSettlements, settlementController.getGroupSettlements);

module.exports = router;