// backend/controllers/adminController.js
const db = require('../config/db');

// Dashboard Statistics
const getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const [usersResult, questionsResult, resultsResult] = await Promise.all([
      db.query('SELECT COUNT(*) as count FROM users'),
      db.query('SELECT COUNT(*) as count FROM questions WHERE is_active = true'),
      db.query('SELECT COUNT(*) as count FROM results'),
    ]);

    // Get average score
    const avgScoreResult = await db.query(
      'SELECT AVG(percentage) as avg_score FROM results WHERE percentage > 0'
    );

    // Get level distribution
    const levelDistribution = await db.query(`
      SELECT color_level, COUNT(*) as count 
      FROM results 
      GROUP BY color_level 
      ORDER BY 
        CASE color_level 
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'weak' THEN 3
        END
    `);

    res.json({
      totalUsers: parseInt(usersResult.rows[0].count),
      totalQuestions: parseInt(questionsResult.rows[0].count),
      totalTests: parseInt(resultsResult.rows[0].count),
      avgScore: Math.round(avgScoreResult.rows[0].avg_score || 0),
      levelDistribution: levelDistribution.rows,
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
      'SELECT * FROM questions ORDER BY id DESC'
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

    const result = await db.query(
      `INSERT INTO questions 
       (level, type, question_ru, question_kg, options_ru, options_kg, correct_answer) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [level, type, question_ru, question_kg, JSON.stringify(options_ru), JSON.stringify(options_kg), correct_answer]
    );

    res.status(201).json({
      message: 'Question created successfully',
      question: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
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
      [level, type, question_ru, question_kg, JSON.stringify(options_ru), JSON.stringify(options_kg), correct_answer, id]
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

    res.json({ message: 'Question deleted successfully' });
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


// История тестов
const getTestHistory = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        r.id,
        u.full_name,
        u.email,
        r.level,
        r.completed_at,
        r.score,
        r.percentage,
        r.color_level,
        jsonb_array_length(r.answers) as total_questions
      FROM results r
      JOIN users u ON r.user_id = u.id
      ORDER BY r.completed_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Экспорттоо
module.exports = {
  // Dashboard
  getDashboardStats,
  
  // Questions
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  
  // Users
  getAllUsers,
  
  // Results
  getAllResults,
};