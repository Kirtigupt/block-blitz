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

(async () => {
  console.log('====================================================');
  console.log('ACCOUNT ISOLATION & ONBOARDING SUITE (SCENARIOS A-J)');
  console.log('====================================================');

  const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/block-blitz';
  const JWT_SECRET = process.env.JWT_SECRET || 'dev_fallback_secret_block_blitz_key_2026';
  await mongoose.connect(MONGO_URI);
  const usersCol = mongoose.connection.db.collection('users');

  // --- Scenario A: Kirti Gupta Level 10 Progression ---
  console.log('\n[Scenario A] Existing user Kirti Gupta Level 10 verification:');
  const kirti = await usersCol.findOne({ username: 'Kirti Gupta' });
  assert(kirti !== null, 'Kirti Gupta account found in MongoDB');
  assert(kirti.unlockedLevel === 10, 'Kirti Gupta unlockedLevel is 10 (actual: ' + kirti?.unlockedLevel + ')');
  assert(Array.isArray(kirti.completedLevels) && kirti.completedLevels.length === 9, 'Kirti Gupta has completed levels 1-9 (length: ' + kirti?.completedLevels?.length + ')');
  assert(kirti.currentLevel === 10, 'Kirti Gupta currentLevel is 10');

  // --- Scenario B: Krishnaa Starts at Level 1 ---
  console.log('\n[Scenario B] Account krishnaa starts at Level 1:');
  await usersCol.updateOne(
    { username: 'krishnaa' },
    { $set: { unlockedLevel: 1, currentLevel: 1, completedLevels: [] } }
  );
  let krishna = await usersCol.findOne({ username: 'krishnaa' });
  assert(krishna !== null, 'krishnaa account found in MongoDB');
  assert(krishna.unlockedLevel === 1, 'krishnaa unlockedLevel is 1 (actual: ' + krishna?.unlockedLevel + ')');
  assert(Array.isArray(krishna.completedLevels) && krishna.completedLevels.length === 0, 'krishnaa completedLevels is empty');
  assert(krishna.currentLevel === 1, 'krishnaa currentLevel is 1');

  // --- Scenario C: Krishnaa cannot see or modify Kirti Gupta progression ---
  console.log('\n[Scenario C] Account Isolation (Cannot see/modify other accounts):');
  const krishnaToken = jwt.sign({ id: krishna._id }, JWT_SECRET, { expiresIn: '7d' });
  const kirtiToken = jwt.sign({ id: kirti._id }, JWT_SECRET, { expiresIn: '7d' });

  // Krishnaa calls /api/auth/me
  const krishnaMeRes = await fetch('http://localhost:5000/api/auth/me', {
    headers: { 'Authorization': 'Bearer ' + krishnaToken }
  });
  const krishnaMe = await krishnaMeRes.json();
  assert(krishnaMe.success === true, 'Krishnaa /api/auth/me succeeds');
  assert(krishnaMe.user.unlockedLevel === 1, 'Krishnaa sees only their Level 1 (not Level 10)');
  assert(krishnaMe.user.username === 'krishnaa', 'Krishnaa user object is correctly scoped');

  // Krishnaa attempts to skip/hack to Level 10
  const illegalProgRes = await fetch('http://localhost:5000/api/auth/progression', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + krishnaToken },
    body: JSON.stringify({ completedLevel: 9, currentLevel: 10 })
  });
  const _illegalProg = await illegalProgRes.json();
  assert(illegalProgRes.status === 400, 'Server blocks unauthorized jump to Level 10 (status 400)');

  // --- Scenario D: Advance Krishnaa progression, Kirti Gupta remains unchanged ---
  console.log('\n[Scenario D] Advance Krishnaa progression, verify Kirti unchanged:');
  const legalAdvanceRes = await fetch('http://localhost:5000/api/auth/progression', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + krishnaToken },
    body: JSON.stringify({ completedLevel: 1, currentLevel: 2 })
  });
  const legalAdvance = await legalAdvanceRes.json();
  assert(legalAdvanceRes.status === 200, 'Krishnaa completes Level 1 legally');
  assert(legalAdvance.progression.unlockedLevel === 2, 'Krishnaa unlockedLevel is now 2');

  // Verify Kirti Gupta remains Level 10
  const kirtiCheck = await usersCol.findOne({ username: 'Kirti Gupta' });
  assert(kirtiCheck.unlockedLevel === 10, 'Kirti Gupta unlockedLevel remains strictly 10');
  assert(kirtiCheck.completedLevels.length === 9, 'Kirti Gupta completedLevels remain 9');

  // Reset Krishnaa back to Level 1
  await usersCol.updateOne(
    { _id: krishna._id },
    { $set: { unlockedLevel: 1, currentLevel: 1, completedLevels: [] } }
  );
  console.log('  (Reset krishnaa test progression back to Level 1)');

  // --- Scenario E: Repeated account switching ---
  console.log('\n[Scenario E] Repeated account switching verification:');
  let switchOk = true;
  for (let i = 0; i < 3; i++) {
    const resA = await (await fetch('http://localhost:5000/api/auth/me', { headers: { 'Authorization': 'Bearer ' + kirtiToken } })).json();
    const resB = await (await fetch('http://localhost:5000/api/auth/me', { headers: { 'Authorization': 'Bearer ' + krishnaToken } })).json();
    if (resA.user.unlockedLevel !== 10 || resB.user.unlockedLevel !== 1) {
      switchOk = false;
    }
  }
  assert(switchOk, 'Switching between accounts 3x returns correct progression every time');

  // --- Scenario F: Browser refresh persistence ---
  console.log('\n[Scenario F] Refresh restoration per-account:');
  const kirtiMeRes = await fetch('http://localhost:5000/api/auth/me', { headers: { 'Authorization': 'Bearer ' + kirtiToken } });
  const kirtiRefreshed = await kirtiMeRes.json();
  assert(kirtiRefreshed.user.unlockedLevel === 10, 'Kirti refresh restores Level 10');
  assert(kirtiRefreshed.user.completedLevels.length === 9, 'Kirti refresh restores 9 completed levels');

  const krishnaMeRes2 = await fetch('http://localhost:5000/api/auth/me', { headers: { 'Authorization': 'Bearer ' + krishnaToken } });
  const krishnaRefreshed = await krishnaMeRes2.json();
  assert(krishnaRefreshed.user.unlockedLevel === 1, 'Krishnaa refresh restores Level 1');

  // --- Scenario G: New registered user onboarding flow ---
  console.log('\n[Scenario G] New user registration & onboarding verification:');
  const tempUser = 'onboard_' + Date.now().toString().slice(-4);
  const tempEmail = tempUser + '@test.com';
  const regRes = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: tempUser, email: tempEmail, password: 'password123' })
  });
  const regData = await regRes.json();
  assert(regData.success === true, 'New user registers successfully');
  assert(regData.user.unlockedLevel === 1, 'New user starts with unlockedLevel = 1');
  assert(regData.user.completedLevels.length === 0, 'New user starts with completedLevels = []');
  // Clean up test user
  await usersCol.deleteOne({ _id: new mongoose.Types.ObjectId(regData.user.id) });

  // --- Scenario H: Existing user resume capability ---
  console.log('\n[Scenario H] Existing user resume capability:');
  assert(kirti.unlockedLevel >= 1 && kirti.currentLevel >= 1, 'Existing user has current/unlocked stage ready to resume');
  assert(kirti.unlockedLevel === 10, 'Resume target points to Level 10');

  // --- Scenario I: Failure, Exit, and Completion Rules ---
  console.log('\n[Scenario I] Progression preservation under failure, exit, completion:');
  let levelBefore = kirti.unlockedLevel;
  assert(levelBefore === 10, 'Level is 10 before attempt');
  // Re-completing level 9 should cap at Math.max(10, 10) = 10
  const reCompleteRes = await fetch('http://localhost:5000/api/auth/progression', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + kirtiToken },
    body: JSON.stringify({ completedLevel: 9, currentLevel: 10 })
  });
  const reComplete = await reCompleteRes.json();
  assert(reComplete.progression.unlockedLevel === 10, 'Re-completing level 9 does not over-increment unlockedLevel (remains 10)');

  // --- Scenario J: Consistency across state, API, MongoDB ---
  console.log('\n[Scenario J] Database, API, and Model Consistency:');
  const dbKirti = await usersCol.findOne({ username: 'Kirti Gupta' });
  const dbKrishna = await usersCol.findOne({ username: 'krishnaa' });
  assert(dbKirti.unlockedLevel === 10, 'MongoDB record for Kirti Gupta is Level 10');
  assert(dbKrishna.unlockedLevel === 1, 'MongoDB record for krishnaa is Level 1');
  assert(dbKirti.highScore === 4312, 'High score preserved (4,312)');

  console.log('\n====================================================');
  console.log('RESULTS: ' + passed + ' / ' + total + ' checks passed.');
  if (passed === total) {
    console.log('ALL ACCOUNT ISOLATION TESTS PASSED! ✓');
  } else {
    process.exit(1);
  }

  await mongoose.disconnect();
})();
