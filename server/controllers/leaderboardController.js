import User from '../models/User.js';
import Game from '../models/Game.js';

/**
 * @desc    Get Global Top Players Leaderboard
 * @route   GET /api/leaderboard/global
 * @access  Public (Optional Auth for personal ranking)
 */
export const getGlobalLeaderboard = async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    // 1. Aggregate cumulative scores and max scores from the Game collection,
    //    de-duplicating by game session to prevent counting identical games more than once.
    const gameAggregations = await Game.aggregate([
      {
        $group: {
          _id: {
            user: '$user',
            sessionOrId: { $ifNull: ['$gameSessionId', '$_id'] }
          },
          score: { $max: '$score' }
        }
      },
      {
        $group: {
          _id: '$_id.user',
          totalScore: { $sum: '$score' },
          maxScore: { $max: '$score' },
          gamesCount: { $sum: 1 }
        }
      }
    ]);

    const gameStatsMap = new Map();
    gameAggregations.forEach((item) => {
      if (item._id) {
        gameStatsMap.set(item._id.toString(), {
          totalScore: item.totalScore || 0,
          maxScore: item.maxScore || 0,
          gamesCount: item.gamesCount || 0
        });
      }
    });

    // 2. Fetch all registered users with relevant ranking fields
    const users = await User.find()
      .select('username highScore totalGamesPlayed totalLinesCleared completedLevels createdAt')
      .lean();

    // 3. Map into clean leaderboard candidate objects with deterministic stats
    const candidates = users.map((u) => {
      const gStats = gameStatsMap.get(u._id.toString());
      const highScore = Math.max(u.highScore || 0, gStats?.maxScore || 0);
      const totalScore = gStats ? Math.max(gStats.totalScore, highScore) : highScore;
      const completedLevelsCount = Array.isArray(u.completedLevels) ? u.completedLevels.length : 0;

      return {
        userId: u._id.toString(),
        username: u.username,
        highScore,
        totalScore,
        completedLevelsCount,
        totalGamesPlayed: Math.max(u.totalGamesPlayed || 0, gStats?.gamesCount || 0),
        totalLinesCleared: u.totalLinesCleared || 0,
        createdAt: u.createdAt
      };
    });

    // 4. Deterministic multi-tier sort:
    //    Primary: Total Valid Score across completed games (descending)
    //    Tie-breaker 1: Highest Single-Game Score (descending)
    //    Tie-breaker 2: Number of Completed Levels (descending)
    //    Tie-breaker 3: Account Seniority (createdAt ascending)
    candidates.sort((a, b) => {
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }
      if (b.highScore !== a.highScore) {
        return b.highScore - a.highScore;
      }
      if (b.completedLevelsCount !== a.completedLevelsCount) {
        return b.completedLevelsCount - a.completedLevelsCount;
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    // Assign integer ranks to all candidates
    const rankedAll = candidates.map((player, idx) => ({
      ...player,
      rank: idx + 1
    }));

    // Filter eligible players for the public board (must have score or completed levels)
    const eligiblePlayers = rankedAll.filter((p) => p.highScore > 0 || p.totalScore > 0 || p.completedLevelsCount > 0);

    // Take top results up to limit
    const leaderboard = eligiblePlayers.slice(0, limit).map((p) => ({
      rank: p.rank,
      username: p.username,
      highScore: p.highScore,
      totalScore: p.totalScore,
      completedLevelsCount: p.completedLevelsCount,
      totalGamesPlayed: p.totalGamesPlayed,
      totalLinesCleared: p.totalLinesCleared
    }));

    // 5. Determine authenticated user's personal rank & stats
    let currentUserStats = null;
    if (req.user) {
      const myId = req.user._id.toString();
      const myRecord = rankedAll.find((p) => p.userId === myId);
      if (myRecord) {
        currentUserStats = {
          rank: myRecord.highScore > 0 || myRecord.completedLevelsCount > 0 ? myRecord.rank : null,
          username: myRecord.username,
          highScore: myRecord.highScore,
          totalScore: myRecord.totalScore,
          completedLevelsCount: myRecord.completedLevelsCount,
          totalGamesPlayed: myRecord.totalGamesPlayed,
          totalLinesCleared: myRecord.totalLinesCleared,
          isInTopList: leaderboard.some((p) => p.username.toLowerCase() === myRecord.username.toLowerCase())
        };
      }
    }

    return res.status(200).json({
      success: true,
      rankingMetric: 'total_score',
      rankingDescription: 'Ranked primarily by Total Valid Score across completed games. Tie-breakers: Highest Single-Game Score, Stages Cleared, Seniority.',
      count: leaderboard.length,
      totalPlayers: eligiblePlayers.length,
      leaderboard,
      currentUserStats
    });
  } catch (error) {
    console.error('getGlobalLeaderboard error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching leaderboard.',
      error: error.message
    });
  }
};
