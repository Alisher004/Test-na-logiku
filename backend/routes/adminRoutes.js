const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getTestHistory,
  getAllUsers,
  getAllResults,
  getTestSettings,
  updateTestSettings,
} = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Questions
router.get('/questions', getAllQuestions);
router.post('/questions', createQuestion);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);

// Test History
router.get('/history', getTestHistory);

// Users
router.get('/users', getAllUsers);

// Results
router.get('/results', getAllResults);

// Test Settings
router.get('/settings', getTestSettings);
router.put('/settings', updateTestSettings);

module.exports = router;