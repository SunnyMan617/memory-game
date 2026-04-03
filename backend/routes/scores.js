const express = require('express');
const router = express.Router();
const Score = require('../models/Score');

// GET /scores — return top 5 scores (fewest moves = best)
router.get('/', async (req, res) => {
  try {
    const { difficulty } = req.query;
    const filter = difficulty ? { difficulty } : {};
    const scores = await Score.find(filter)
      .sort({ coups: 1, time: 1, date: -1 })
      .limit(5)
      .select('pseudo coups difficulty time date');
    res.json(scores);
  } catch (error) {
    console.error('Error fetching scores:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch scores' });
  }
});

// POST /scores — save a new score
router.post('/', async (req, res) => {
  try {
    const { pseudo, coups, difficulty, time } = req.body;

    if (!pseudo || !coups) {
      return res.status(400).json({
        success: false,
        message: 'Username (pseudo) and moves (coups) are required',
      });
    }

    const score = new Score({
      pseudo: pseudo.trim(),
      coups,
      difficulty: difficulty || 'medium',
      time: time || null,
    });

    await score.save();
    res.status(201).json({ success: true, message: 'Score saved' });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    console.error('Error saving score:', error);
    res.status(500).json({ success: false, message: 'Failed to save score' });
  }
});

module.exports = router;
