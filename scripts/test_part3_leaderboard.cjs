/**
 * Verification Test Suite for Part 3:
 * Global Leaderboard, Score Integrity, Duplicate Prevention, and Regression Checks.
 */

const mongoose = require('../server/node_modules/mongoose');
const jwt = require('../server/node_modules/jsonwebtoken');

let passed = 0;
let total = 0;

function assert(condition, testName) {
  total++;
  if (condition) {
    passed++;
    console.log('  ✓ ' + testName);
  } else {
    console.error('  ✗ FAIL: ' + testName);
  }
}

const path = require('path');
const dotenv = require('../server/node_modules/dotenv');
dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

const BASE_URL = 'http://localhost:5000';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_fallback_secret_block_blitz_key_2026';
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/block-blitz';

(async () => {
  console.log('====================================================');
  console.log('BLOCK BLITZ PART 3: LEADERBOARD & INTEGRITY SUITE');
  console.log('====================================================');

  await mongoose.connect(MONGO_URI);
  const usersCol = mongoose.connection.db.collection('users');
  const gamesCol = mongoose.connection.db.collection('games');

  // --- SECTION 1: LEADERBOARD API & DETERMINISTIC RANKING ---
  console.log('\n[Section 1: Public Leaderboard Endpoint & Ranking Order]');
  
  const publicRes = await fetch(`${BASE_URL}/api/leaderboard/global`);
  assert(publicRes.status === 200, 'Public leaderboard responds with HTTP 200');
  
  const publicData = await publicRes.json();
  assert(publicData.success === true, 'Response success is true');
  assert(publicData.rankingMetric === 'highest_score', 'Ranking metric defined as highest_score');
  assert(typeof publicData.rankingDescription === 'string', 'Ranking description documented');
  assert(Array.isArray(publicData.leaderboard), 'Leaderboard is an array');
  assert(publicData.leaderboard.length > 0, 'Leaderboard contains real player records');
  assert(publicData.currentUserStats === null, 'Unauthenticated response has null currentUserStats');

  // Validate fields in every leaderboard item (No sensitive info leaked)
  let noLeak = true;
  let hasRequiredFields = true;
  let isSortedDescending = true;

  for (let i = 0; i < publicData.leaderboard.length; i++) {
    const item = publicData.leaderboard[i];
    if (item.password || item.email || item.token || item._id) {
      noLeak = false;
    }
    if (
      typeof item.rank !== 'number' ||
      !item.username ||
      typeof item.highScore !== 'number' ||
      typeof item.totalScore !== 'number' ||
      typeof item.completedLevelsCount !== 'number'
    ) {
      hasRequiredFields = false;
    }
    if (i > 0) {
      const prev = publicData.leaderboard[i - 1];
      if (prev.highScore < item.highScore) {
        isSortedDescending = false;
      }
    }
  }

  assert(noLeak, 'Zero passwords, emails, or private tokens leaked in leaderboard data');
  assert(hasRequiredFields, 'All entries have rank, username, highScore, totalScore, completedLevelsCount');
  assert(isSortedDescending, 'Leaderboard is deterministically sorted descending by highest score');

  // --- SECTION 2: TOP 3 PODIUM INTEGRITY ---
  console.log('\n[Section 2: Top-Three Podium Verification]');
  const top1 = publicData.leaderboard[0];
  const top2 = publicData.leaderboard[1];
  const top3 = publicData.leaderboard[2];

  assert(top1 && top1.rank === 1, 'Top 1 is Rank #1');
  assert(top1.username === 'Kirti Gupta', 'Rank #1 is Kirti Gupta with verified real data');
  assert(top1.highScore === 4312, 'Rank #1 has high score 4,312');
  assert(top1.completedLevelsCount === 9, 'Rank #1 has 9 completed levels');
  assert(top1.totalScore >= top1.highScore, 'Rank #1 totalScore (' + top1.totalScore + ') >= highScore');

  if (top2) {
    assert(top2.rank === 2, 'Top 2 is Rank #2');
    assert(top2.highScore <= top1.highScore, 'Rank #2 score <= Rank #1 score');
  }
  if (top3) {
    assert(top3.rank === 3, 'Top 3 is Rank #3');
    assert(top3.highScore <= top2.highScore, 'Rank #3 score <= Rank #2 score');
  }

  // --- SECTION 3: AUTHENTICATED LEADERBOARD & CURRENT USER HIGHLIGHT ---
  console.log('\n[Section 3: Authenticated User Personal Ranking Highlight]');
  const kirtiUser = await usersCol.findOne({ username: 'Kirti Gupta' });
  const kirtiToken = jwt.sign({ id: kirtiUser._id }, JWT_SECRET, { expiresIn: '1d' });

  const kirtiRes = await fetch(`${BASE_URL}/api/leaderboard/global`, {
    headers: { Authorization: `Bearer ${kirtiToken}` }
  });
  const kirtiData = await kirtiRes.json();
  assert(kirtiData.currentUserStats !== null, 'Authenticated user receives currentUserStats');
  assert(kirtiData.currentUserStats.username === 'Kirti Gupta', 'currentUserStats matches authenticated username');
  assert(kirtiData.currentUserStats.rank === 1, 'Kirti Gupta identified as Rank #1 in personal dock');
  assert(kirtiData.currentUserStats.highScore === 4312, 'Personal dock shows high score 4,312');
  assert(kirtiData.currentUserStats.completedLevelsCount === 9, 'Personal dock shows 9 completed stages');
  assert(kirtiData.currentUserStats.isInTopList === true, 'Kirti is identified inside the top list');

  // Test another user: krishnaa
  const krishnaUser = await usersCol.findOne({ username: 'krishnaa' });
  const krishnaToken = jwt.sign({ id: krishnaUser._id }, JWT_SECRET, { expiresIn: '1d' });

  const krishnaRes = await fetch(`${BASE_URL}/api/leaderboard/global`, {
    headers: { Authorization: `Bearer ${krishnaToken}` }
  });
  const krishnaData = await krishnaRes.json();
  assert(krishnaData.currentUserStats !== null, 'krishnaa receives currentUserStats');
  assert(krishnaData.currentUserStats.username === 'krishnaa', 'krishnaa username matches');
  assert(typeof krishnaData.currentUserStats.rank === 'number', 'krishnaa has a verified numeric rank (#' + krishnaData.currentUserStats.rank + ')');
  assert(krishnaData.currentUserStats.highScore === 1118, 'krishnaa high score is 1,118');

  // --- SECTION 4: BACKEND SCORE INTEGRITY & DUPLICATE PROTECTION ---
  console.log('\n[Section 4: Score Validation & Duplicate Prevention]');

  // Create isolated disposable test user
  const testUsername = `audit_tester_${Date.now()}`;
  const testEmail = `${testUsername}@example.com`;
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: testUsername,
      email: testEmail,
      password: 'password123'
    })
  });
  assert(regRes.status === 201, 'Disposable test account registered');
  const regData = await regRes.json();
  const testToken = regData.token;
  const testUserId = regData.user.id;

  // New user starts with zero score
  assert(regData.user.highScore === 0, 'New user starts with 0 highScore');
  assert(regData.user.totalGamesPlayed === 0, 'New user starts with 0 totalGamesPlayed');

  // Test 1: Reject negative score
  const negRes = await fetch(`${BASE_URL}/api/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${testToken}` },
    body: JSON.stringify({ score: -50, linesCleared: 1, maxStreak: 1 })
  });
  assert(negRes.status === 400, 'Negative score rejected with 400 Bad Request');

  // Test 2: Reject non-numeric score
  const strRes = await fetch(`${BASE_URL}/api/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${testToken}` },
    body: JSON.stringify({ score: 'invalid_points' })
  });
  assert(strRes.status === 400, 'String score rejected with 400 Bad Request');

  // Test 3: Reject absurd overflow score (> 50,000,000)
  const hugeRes = await fetch(`${BASE_URL}/api/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${testToken}` },
    body: JSON.stringify({ score: 999999999 })
  });
  assert(hugeRes.status === 400, 'Absurd overflow score rejected with 400 Bad Request');

  // Test 4: Valid initial score submission with gameSessionId
  const sessionId1 = `session_${Date.now()}_testA`;
  const save1 = await fetch(`${BASE_URL}/api/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${testToken}` },
    body: JSON.stringify({
      score: 1500,
      linesCleared: 5,
      maxStreak: 2,
      gameSessionId: sessionId1
    })
  });
  assert(save1.status === 201, 'Valid score saved successfully (HTTP 201)');
  const save1Data = await save1.json();
  assert(save1Data.stats.highScore === 1500, 'New high score set to 1,500');
  assert(save1Data.stats.totalGamesPlayed === 1, 'Total games played is 1');

  // Test 5: Re-submitting the same gameSessionId (Idempotent duplicate protection)
  const saveDuplicate = await fetch(`${BASE_URL}/api/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${testToken}` },
    body: JSON.stringify({
      score: 1500,
      linesCleared: 5,
      maxStreak: 2,
      gameSessionId: sessionId1
    })
  });
  assert(saveDuplicate.status === 200, 'Duplicate submission handled gracefully (HTTP 200)');
  const dupData = await saveDuplicate.json();
  assert(dupData.isDuplicate === true, 'isDuplicate flag is true');

  // Verify DB did NOT double-increment totalGamesPlayed or lines
  const testUserDb = await usersCol.findOne({ _id: new mongoose.Types.ObjectId(testUserId) });
  assert(testUserDb.totalGamesPlayed === 1, 'totalGamesPlayed was NOT inflated (remains strictly 1)');
  assert(testUserDb.totalLinesCleared === 5, 'totalLinesCleared was NOT inflated (remains strictly 5)');

  // Test 6: Verify lower score does not overwrite high score
  const saveLower = await fetch(`${BASE_URL}/api/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${testToken}` },
    body: JSON.stringify({
      score: 800,
      linesCleared: 2,
      maxStreak: 1,
      gameSessionId: `session_${Date.now()}_lower`
    })
  });
  const lowerData = await saveLower.json();
  assert(lowerData.stats.highScore === 1500, 'Lower score (800) did not lower high score (remains 1,500)');
  assert(lowerData.stats.isNewHighScore === false, 'isNewHighScore is false for lower score');

  // Cleanup test user & games
  await gamesCol.deleteMany({ user: new mongoose.Types.ObjectId(testUserId) });
  await usersCol.deleteOne({ _id: new mongoose.Types.ObjectId(testUserId) });

  // --- SECTION 5: ACCOUNT ISOLATION & PROGRESSION PRESERVATION ---
  console.log('\n[Section 5: Account Isolation & Real Data Preservation]');
  const kirtiFinal = await usersCol.findOne({ username: 'Kirti Gupta' });
  assert(kirtiFinal.unlockedLevel === 10, 'Kirti Gupta unlockedLevel preserved at 10');
  assert(kirtiFinal.completedLevels.length === 9, 'Kirti Gupta completedLevels preserved at 9');
  assert(kirtiFinal.highScore === 4312, 'Kirti Gupta highScore preserved at 4,312');

  const krishnaFinal = await usersCol.findOne({ username: 'krishnaa' });
  assert(krishnaFinal.unlockedLevel === 1, 'krishnaa unlockedLevel preserved at 1');
  assert(krishnaFinal.completedLevels.length === 0, 'krishnaa completedLevels preserved at 0');

  await mongoose.disconnect();

  console.log('\n====================================================');
  console.log(`RESULTS: ${passed} / ${total} checks passed.`);
  if (passed === total) {
    console.log('ALL PART 3 VERIFICATION CHECKS PASSED! ✓');
  } else {
    console.error('SOME CHECKS FAILED!');
    process.exit(1);
  }
})();
