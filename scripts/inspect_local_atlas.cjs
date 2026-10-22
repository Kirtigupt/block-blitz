const mongoose = require('../server/node_modules/mongoose');
const dotenv = require('../server/node_modules/dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

(async () => {
  let localConn, atlasConn;
  try {
    console.log('Connecting to Local MongoDB...');
    localConn = await mongoose.createConnection('mongodb://127.0.0.1:27017/block-blitz').asPromise();
    console.log('Connecting to Atlas MongoDB...');
    atlasConn = await mongoose.createConnection(process.env.MONGODB_URI).asPromise();

    const localUsers = await localConn.db.collection('users').find({}).toArray();
    const localGames = await localConn.db.collection('games').find({}).toArray();

    const atlasUsers = await atlasConn.db.collection('users').find({}).toArray();
    const atlasGames = await atlasConn.db.collection('games').find({}).toArray();

    console.log('\n=== LOCAL DATABASE SUMMARY ===');
    console.log('Local Database:', localConn.name);
    console.log('Local Users count:', localUsers.length);
    console.log('Local Games count:', localGames.length);

    console.log('\nLocal Users List (passwords hidden):');
    localUsers.forEach((u, i) => {
      console.log(`  [${i + 1}] _id: ${u._id} | username: "${u.username}" | email: "${u.email}" | level: ${u.unlockedLevel} | high: ${u.highScore} | games: ${u.totalGamesPlayed}`);
    });

    console.log('\n=== ATLAS DATABASE SUMMARY ===');
    console.log('Atlas Database:', atlasConn.name);
    console.log('Atlas Host:', atlasConn.host);
    console.log('Atlas Users count:', atlasUsers.length);
    console.log('Atlas Games count:', atlasGames.length);

    if (atlasUsers.length > 0) {
      console.log('Atlas Users present:');
      atlasUsers.forEach((u, i) => {
        console.log(`  [${i + 1}] _id: ${u._id} | username: "${u.username}" | email: "${u.email}"`);
      });
    }

    if (atlasGames.length > 0) {
      console.log('Atlas Games present:', atlasGames.length);
    }

    // Conflict Detection
    console.log('\n=== CONFLICT & INTEGRITY ANALYSIS ===');
    const atlasUserIds = new Set(atlasUsers.map(u => u._id.toString()));
    const atlasUsernames = new Set(atlasUsers.map(u => u.username.toLowerCase()));
    const atlasEmails = new Set(atlasUsers.map(u => u.email.toLowerCase()));
    const atlasGameIds = new Set(atlasGames.map(g => g._id.toString()));

    const idConflictsUsers = localUsers.filter(u => atlasUserIds.has(u._id.toString()));
    const usernameConflicts = localUsers.filter(u => atlasUsernames.has(u.username.toLowerCase()));
    const emailConflicts = localUsers.filter(u => atlasEmails.has(u.email.toLowerCase()));
    const idConflictsGames = localGames.filter(g => atlasGameIds.has(g._id.toString()));

    console.log('User _id conflicts:', idConflictsUsers.length);
    console.log('Username conflicts:', usernameConflicts.length);
    console.log('Email conflicts:', emailConflicts.length);
    console.log('Game _id conflicts:', idConflictsGames.length);

    // Foreign Key Integrity
    const localUserIds = new Set(localUsers.map(u => u._id.toString()));
    const orphanGames = localGames.filter(g => !localUserIds.has(g.user.toString()));
    console.log('Orphan local games (referencing non-existent user):', orphanGames.length);

    // Check indexes on collections in local and Atlas
    const localUserIndexes = await localConn.db.collection('users').indexes();
    const localGameIndexes = await localConn.db.collection('games').indexes();
    console.log('\nLocal user indexes:', localUserIndexes.map(ix => ix.name));
    console.log('Local game indexes:', localGameIndexes.map(ix => ix.name));

  } catch (err) {
    console.error('Inspection error:', err.message);
  } finally {
    if (localConn) await localConn.close();
    if (atlasConn) await atlasConn.close();
  }
})();
