const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
  pseudo: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    maxlength: [20, 'Username cannot exceed 20 characters'],
  },
  coups: {
    type: Number,
    required: [true, 'Number of moves is required'],
    min: [6, 'Minimum possible moves is 6'],
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  time: {
    type: Number, // seconds
    default: null,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Score', ScoreSchema);
