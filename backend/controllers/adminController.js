const db = require('../config/db');

// Dashboard Statistics
const getDashboardStats = async (req, res) => {
  try {
    const [usersResult, questionsResult, resultsResult] = await Promise.all([
      db.query('SELECT COUNT(*) as count FROM users'),
      db.query('SELECT COUNT(*) as count FROM questions WHERE is_active = true'),
      db.query('SELECT COUNT(*) as count FROM results'),
    ]);

    const avgScoreResult = await db.query(
      'SELECT AVG(percentage) as avg_score FROM results WHERE percentage > 0'
    );

    const levelDistribution = await db.query(`
      SELECT color_level, COUNT(*) as count 
      FROM results 
      GROUP BY color_level
    `);

    const recentResults = await db.query(`
      SELECT r.*, u.full_name, u.email 
      FROM results r
      JOIN users u ON r.user_id = u.id
      ORDER BY r.completed_at DESC 
      LIMIT 10
    `);

    res.json({
      totalUsers: parseInt(usersResult.rows[0].count),
      totalQuestions: parseInt(questionsResult.rows[0].count),
      totalTests: parseInt(resultsResult.rows[0].count),
      avgScore: Math.round(avgScoreResult.rows[0].avg_score || 0),
      levelDistribution: levelDistribution.rows,
      recentResults: recentResults.rows,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Questions Management
const getAllQuestions = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM questions ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const createQuestion = async (req, res) => {
  try {
    const { level, type, question_ru, question_kg, options_ru, options_kg, correct_answer } = req.body;

    // Validate based on question type
    if (type === 'logic') {
      if (!options_ru || !options_kg || options_ru.length !== 4 || options_kg.length !== 4) {
        return res.status(400).json({ error: 'Logic questions require 4 options' });
      }
    }

    const result = await db.query(
      `INSERT INTO questions 
       (level, type, question_ru, question_kg, options_ru, options_kg, correct_answer) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [
        level, 
        type, 
        question_ru, 
        question_kg, 
        type === 'logic' ? JSON.stringify(options_ru) : null,
        type === 'logic' ? JSON.stringify(options_kg) : null,
        correct_answer
      ]
    );

    res.status(201).json({
      message: 'Question created successfully',
      question: result.rows[0]
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { level, type, question_ru, question_kg, options_ru, options_kg, correct_answer } = req.body;

    const result = await db.query(
      `UPDATE questions 
       SET level = $1, type = $2, question_ru = $3, question_kg = $4, 
           options_ru = $5, options_kg = $6, correct_answer = $7, updated_at = NOW()
       WHERE id = $8 
       RETURNING *`,
      [
        level, 
        type, 
        question_ru, 
        question_kg, 
        type === 'logic' ? JSON.stringify(options_ru) : null,
        type === 'logic' ? JSON.stringify(options_kg) : null,
        correct_answer, 
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({
      message: 'Question updated successfully',
      question: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM questions WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({ 
      message: 'Question deleted successfully',
      deletedId: result.rows[0].id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Test History
const getTestHistory = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM results ORDER BY completed_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Users Management
const getAllUsers = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, full_name, email, role, created_at 
       FROM users 
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Results Management
const getAllResults = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.*, u.full_name, u.email 
       FROM results r
       JOIN users u ON r.user_id = u.id
       ORDER BY r.completed_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Test Settings Management
const getTestSettings = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM test_settings ORDER BY level'
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateTestSettings = async (req, res) => {
  try {
    const { level, question_count, time_minutes } = req.body;

    const result = await db.query(
      `UPDATE test_settings 
       SET question_count = $1, time_minutes = $2, updated_at = NOW()
       WHERE level = $3 
       RETURNING *`,
      [question_count, time_minutes, level]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test setting not found' });
    }

    res.json({
      message: 'Test settings updated successfully',
      setting: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
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
};