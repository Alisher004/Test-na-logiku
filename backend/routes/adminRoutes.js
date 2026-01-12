// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getAllUsers,
  getAllResults,
} = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Questions management
router.get('/questions', getAllQuestions);
router.post('/questions', createQuestion);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);

// Users management
router.get('/users', getAllUsers);

// Results management
router.get('/results', getAllResults);

module.exports = router;