const db = require('../config/db');

const getQuestions = async (req, res) => {
  try {
    const { level } = req.params;
    const lang = req.query.lang || 'ru';

    // Get test time from settings
    const settingsResult = await db.query(
      'SELECT time_minutes FROM test_settings WHERE level = $1',
      [level]
    );
    
    const timeMinutes = settingsResult.rows[0]?.time_minutes || 20;

    // Get all active questions for this level (no limit - use all available questions)
    const result = await db.query(
      `SELECT id, 
              level, 
              type,
              ${lang === 'kg' ? 'question_kg as question' : 'question_ru as question'},
              ${lang === 'kg' ? 'options_kg as options' : 'options_ru as options'},
              correct_answer,
              CASE WHEN image_file IS NOT NULL THEN CONCAT('/api/questions/', id, '/image') ELSE NULL END as image_url,
              image_filename
       FROM questions 
       WHERE level = $1 AND is_active = true 
       ORDER BY RANDOM()`,
      [level]
    );

    const questions = result.rows.map(q => {
      const { correct_answer, ...question } = q;
      return question;
    });

    res.json({ questions, timeMinutes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const submitTest = async (req, res) => {
  try {
    const { userId, level, answers, startTime } = req.body;

    // Get test time from settings
    const settingsResult = await db.query(
      'SELECT time_minutes FROM test_settings WHERE level = $1',
      [level]
    );
    
    const testTime = settingsResult.rows[0]?.time_minutes || 20;

    // Check if time expired
    const currentTime = Date.now();
    const elapsed = (currentTime - startTime) / 1000 / 60; // minutes
    if (elapsed > testTime) {
      return res.status(400).json({ error: 'Время теста истекло' });
    }

    const existingResult = await db.query(
      'SELECT * FROM results WHERE user_id = $1 AND level = $2',
      [userId, level]
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json({ error: 'Тест уже пройден для этого уровня' });
    }

    const questionsResult = await db.query(
      'SELECT id, correct_answer, type FROM questions WHERE level = $1 AND is_active = true',
      [level]
    );

    const questions = questionsResult.rows;
    const totalQuestions = questions.length;
    
    let correctCount = 0;
    
    answers.forEach(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      if (question && answer.answer === question.correct_answer) {
        correctCount++;
      }
    });

    const percentage = totalQuestions > 0 
      ? Math.round((correctCount / totalQuestions) * 100) 
      : 0;

    let colorLevel = '';
    if (percentage <= 40) colorLevel = 'weak';
    else if (percentage <= 70) colorLevel = 'medium';
    else colorLevel = 'high';

    const result = await db.query(
      `INSERT INTO results 
       (user_id, level, score, percentage, color_level, answers, completed_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
       RETURNING *`,
      [userId, level, correctCount, percentage, colorLevel, JSON.stringify(answers)]
    );

    res.json({
      message: 'Test submitted successfully',
      result: {
        score: correctCount,
        percentage,
        colorLevel,
        totalQuestions: totalQuestions,
        correctAnswers: correctCount,
        testTime: testTime
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getResults = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await db.query(
      `SELECT r.*, u.full_name, u.email,
       (SELECT COUNT(*) FROM questions WHERE level = r.level AND is_active = true) as total_questions
       FROM results r
       JOIN users u ON r.user_id = u.id
       WHERE r.user_id = $1
       ORDER BY r.completed_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getQuestions, submitTest, getResults };