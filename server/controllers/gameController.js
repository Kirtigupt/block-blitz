import Game from '../models/Game.js';
import User from '../models/User.js';

/**
 * @desc    Save completed game session & update user stats
 * @route   POST /api/games
 * @access  Private (Requires JWT)
 */
export const saveGame = async (req, res) => {
  try {
    const { score, linesCleared, maxStreak, gameSessionId } = req.body;

    // 1. Validate inputs (integer, finite, non-negative, realistic ceiling)
    if (
      score === undefined ||
      score === null ||
      typeof score !== 'number' ||
      !Number.isFinite(score) ||
      score < 0 ||
      score > 50000000 ||
      Math.floor(score) !== score
    ) {
      return res.status(400).json({
        success: false,
        message: 'A valid non-negative integer score is required.'
      });
    }

    const safeLines = typeof linesCleared === 'number' && Number.isFinite(linesCleared) && linesCleared >= 0
      ? Math.round(linesCleared)
      : 0;
    const safeStreak = typeof maxStreak === 'number' && Number.isFinite(maxStreak) && maxStreak >= 0
      ? Math.round(maxStreak)
      : 0;

    // 2. Fetch authenticated user (enforcing auth token as sole identity authority)
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    // 3. Prevent duplicate submissions:
    // 3a. Idempotency by gameSessionId if provided
    if (gameSessionId && typeof gameSessionId === 'string') {
      const existingSessionGame = await Game.findOne({ user: user._id, gameSessionId });
      if (existingSessionGame) {
        return res.status(200).json({
          success: true,
          message: 'Game score already recorded (duplicate submission prevented).',
          game: existingSessionGame,
          isDuplicate: true,
          stats: {
            highScore: user.highScore,
            totalGamesPlayed: user.totalGamesPlayed,
            totalLinesCleared: user.totalLinesCleared,
            isNewHighScore: false
          }
        });
      }
    }

    // 3b. Temporal deduplication within 3.5 seconds for identical payload
    const recentDuplicate = await Game.findOne({
      user: user._id,
      score,
      linesCleared: safeLines,
      maxStreak: safeStreak,
      playedAt: { $gte: new Date(Date.now() - 3500) }
    });

    if (recentDuplicate) {
      return res.status(200).json({
        success: true,
        message: 'Recent score already recorded (duplicate submission prevented).',
        game: recentDuplicate,
        isDuplicate: true,
        stats: {
          highScore: user.highScore,
          totalGamesPlayed: user.totalGamesPlayed,
          totalLinesCleared: user.totalLinesCleared,
          isNewHighScore: false
        }
      });
    }

    // 4. Determine if this run achieved a new personal high score
    const isNewHighScore = score > user.highScore;

    // 5. Create the game record
    const game = await Game.create({
      user: user._id,
      username: user.username,
      score,
      linesCleared: safeLines,
      maxStreak: safeStreak,
      isNewHighScore,
      gameSessionId: gameSessionId || undefined
    });

    // 6. Update user lifetime stats
    if (isNewHighScore) {
      user.highScore = score;
    }
    user.totalGamesPlayed += 1;
    user.totalLinesCleared += safeLines;

    await user.save();

    return res.status(201).json({
      success: true,
      message: isNewHighScore ? '🎉 New personal high score recorded!' : 'Game recorded successfully',
      game,
      stats: {
        highScore: user.highScore,
        totalGamesPlayed: user.totalGamesPlayed,
        totalLinesCleared: user.totalLinesCleared,
        isNewHighScore
      }
    });
  } catch (error) {
    console.error('saveGame error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while saving game.',
      error: error.message
    });
  }
};

/**
 * @desc    Get authenticated user's last 20 games (newest first)
 * @route   GET /api/games/my-history
 * @access  Private (Requires JWT)
 */
export const getMyHistory = async (req, res) => {
  try {
    const games = await Game.find({ user: req.user._id })
      .sort({ playedAt: -1 })
      .limit(20)
      .lean();

    return res.status(200).json({
      success: true,
      count: games.length,
      games
    });
  } catch (error) {
    console.error('getMyHistory error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching game history.',
      error: error.message
    });
  }
};

/**
 * @desc    Get authenticated user's career stats
 * @route   GET /api/games/my-stats
 * @access  Private (Requires JWT)
 */
export const getMyStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      'username highScore totalGamesPlayed totalLinesCleared createdAt'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    return res.status(200).json({
      success: true,
      stats: {
        username: user.username,
        highScore: user.highScore,
        totalGamesPlayed: user.totalGamesPlayed,
        totalLinesCleared: user.totalLinesCleared,
        memberSince: user.createdAt
      }
    });
  } catch (error) {
    console.error('getMyStats error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching user stats.',
      error: error.message
    });
  }
};
