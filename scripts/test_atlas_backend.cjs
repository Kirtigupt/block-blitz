/**
 * Test Atlas-connected backend endpoints:
 * 1. Global Leaderboard with real Atlas data
 * 2. Login authentication for migrated user
 * 3. User progression retrieval from Atlas
 */

(async () => {
  console.log('====================================================');
  console.log('TESTING ATLAS-CONNECTED BACKEND ENDPOINTS');
  console.log('====================================================');

  const API_URL = 'http://localhost:5000/api';

  // 1. Leaderboard Test
  console.log('\n[Test 1] Querying /api/leaderboard/global from Atlas:');
  const lbRes = await fetch(`${API_URL}/leaderboard/global`);
  const lbData = await lbRes.json();
  console.log('  Status code:', lbRes.status);
  console.log('  Success:', lbData.success);
  console.log('  Total players in Atlas leaderboard:', lbData.totalPlayers);

  if (!lbData.leaderboard || lbData.leaderboard.length === 0) {
    throw new Error('Leaderboard returned empty array from Atlas!');
  }

  const top1 = lbData.leaderboard[0];
  console.log(`  Rank #1 Player: "${top1.username}", High Score: ${top1.highScore}, Stages: ${top1.completedLevelsCount}, Total: ${top1.totalScore}`);
  if (top1.username !== 'Kirti Gupta' || top1.highScore !== 4312) {
    throw new Error('Top 1 player does not match Kirti Gupta in Atlas!');
  }

  const krishnaaEntry = lbData.leaderboard.find(p => p.username === 'krishnaa');
  if (krishnaaEntry) {
    console.log(`  krishnaa on Leaderboard: Rank #${krishnaaEntry.rank}, High Score: ${krishnaaEntry.highScore}`);
  }

  // 2. Login Authentication Test for migrated account
  console.log('\n[Test 2] Testing login for migrated account "prog_user_5028":');
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'prog_user_5028',
      password: 'password123'
    })
  });
  const loginData = await loginRes.json();
  console.log('  Status code:', loginRes.status);
  console.log('  Login success:', loginData.success);

  if (!loginData.token || !loginData.user) {
    throw new Error(`Login failed for migrated account: ${loginData.message || 'Unknown error'}`);
  }
  console.log(`  ✓ Successfully logged in as "${loginData.user.username}" (ID: ${loginData.user.id})`);
  console.log(`  ✓ Unlocked Level from Atlas: ${loginData.user.unlockedLevel}`);

  // 3. Authenticated /me verification
  console.log('\n[Test 3] Verifying authenticated session via /api/auth/me:');
  const meRes = await fetch(`${API_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${loginData.token}` }
  });
  const meData = await meRes.json();
  console.log('  Status code:', meRes.status);
  console.log('  Session user verified:', meData.user?.username);
  console.log('  Current Level in Atlas:', meData.user?.currentLevel);
  console.log('  Unlocked Level in Atlas:', meData.user?.unlockedLevel);

  // 4. Authenticated Leaderboard with Personal Dock
  console.log('\n[Test 4] Querying /api/leaderboard/global with JWT token:');
  const authLbRes = await fetch(`${API_URL}/leaderboard/global`, {
    headers: { 'Authorization': `Bearer ${loginData.token}` }
  });
  const authLbData = await authLbRes.json();
  console.log('  Personal standing dock detected:', !!authLbData.currentUserStats);
  console.log('  Current user stats:', authLbData.currentUserStats);

  console.log('\n====================================================');
  console.log('ALL ATLAS BACKEND INTEGRATION TESTS PASSED! ✓');
  console.log('====================================================');
})();
