import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true
    },
    score: {
      type: Number,
      required: [true, 'Score is required'],
      min: [0, 'Score cannot be negative'],
      index: true
    },
    linesCleared: {
      type: Number,
      default: 0,
      min: [0, 'Lines cleared cannot be negative']
    },
    maxStreak: {
      type: Number,
      default: 0,
      min: [0, 'Max streak cannot be negative']
    },
    isNewHighScore: {
      type: Boolean,
      default: false
    },
    gameSessionId: {
      type: String,
      sparse: true,
      index: true
    },
    playedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index for querying a specific user's game history sorted by date
gameSchema.index({ user: 1, playedAt: -1 });

// Index for high scores (useful for leaderboard queries)
gameSchema.index({ score: -1, playedAt: -1 });

export const Game = mongoose.model('Game', gameSchema);
export default Game;
