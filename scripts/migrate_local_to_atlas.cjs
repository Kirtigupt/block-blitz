/**
 * BLOCK BLITZ — Safe Local to MongoDB Atlas Migration Script
 * Migrates 9 users and 23 games preserving exact ObjectIds, bcrypt hashes, and references.
 */

const mongoose = require('../server/node_modules/mongoose');
const dotenv = require('../server/node_modules/dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

const LOCAL_URI = 'mongodb://127.0.0.1:27017/block-blitz';
const ATLAS_URI = process.env.MONGODB_URI;

if (!ATLAS_URI) {
  console.error('ERROR: MONGODB_URI not found in server/.env');
  process.exit(1);
}

(async () => {
  console.log('====================================================');
  console.log('BLOCK BLITZ: LOCAL TO ATLAS MIGRATION PIPELINE');
  console.log('====================================================');

  let localConn, atlasConn;
  try {
    // 1. Establish connections
    console.log('[Step 1] Connecting to local MongoDB...');
    localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log(`  ✓ Connected to Local Database: "${localConn.name}"`);

    console.log('[Step 2] Connecting to MongoDB Atlas...');
    atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
    console.log(`  ✓ Connected to Atlas Cluster (${atlasConn.host}), Database: "${atlasConn.name}"`);

    // 2. Validate database names
    if (localConn.name !== 'block-blitz' || atlasConn.name !== 'block-blitz') {
      throw new Error(`Database name mismatch! Expected "block-blitz", got local="${localConn.name}", atlas="${atlasConn.name}"`);
    }

    const localUsersCol = localConn.db.collection('users');
    const localGamesCol = localConn.db.collection('games');
    const atlasUsersCol = atlasConn.db.collection('users');
    const atlasGamesCol = atlasConn.db.collection('games');

    // 3. Pre-flight check: Source counts
    const localUsers = await localUsersCol.find({}).toArray();
    const localGames = await localGamesCol.find({}).toArray();

    console.log('\n[Step 3] Pre-flight Source Verification:');
    console.log(`  Local Users count: ${localUsers.length} (expected: 9)`);
    console.log(`  Local Games count: ${localGames.length} (expected: 23)`);

    if (localUsers.length !== 9 || localGames.length !== 23) {
      throw new Error(`Unexpected local document counts! Found ${localUsers.length} users and ${localGames.length} games.`);
    }

    // 4. Pre-flight check: Target counts & Conflict Detection
    const atlasUserCount = await atlasUsersCol.countDocuments();
    const atlasGameCount = await atlasGamesCol.countDocuments();
    console.log('\n[Step 4] Pre-flight Target & Conflict Verification:');
    console.log(`  Atlas current Users count: ${atlasUserCount}`);
    console.log(`  Atlas current Games count: ${atlasGameCount}`);

    if (atlasUserCount > 0 || atlasGameCount > 0) {
      console.log('  Checking for collisions against existing Atlas documents...');
      const existingAtlasUsers = await atlasUsersCol.find({}).toArray();
      const existingAtlasGames = await atlasGamesCol.find({}).toArray();

      const atlasUserIds = new Set(existingAtlasUsers.map(u => u._id.toString()));
      const atlasUsernames = new Set(existingAtlasUsers.map(u => u.username.toLowerCase()));
      const atlasEmails = new Set(existingAtlasUsers.map(u => u.email.toLowerCase()));
      const atlasGameIds = new Set(existingAtlasGames.map(g => g._id.toString()));

      const conflictingUsers = localUsers.filter(u => 
        atlasUserIds.has(u._id.toString()) || 
        atlasUsernames.has(u.username.toLowerCase()) || 
        atlasEmails.has(u.email.toLowerCase())
      );
      const conflictingGames = localGames.filter(g => atlasGameIds.has(g._id.toString()));

      if (conflictingUsers.length > 0 || conflictingGames.length > 0) {
        throw new Error(`Conflict detected! Found ${conflictingUsers.length} user conflicts and ${conflictingGames.length} game conflicts in Atlas. Migration aborted.`);
      }
    }
    console.log('  ✓ Zero collisions detected in Atlas.');

    // 5. Migrate Users (Raw insertion preserves bcrypt hashes, ObjectIds, and dates)
    console.log('\n[Step 5] Migrating Users to Atlas...');
    const userInsertResult = await atlasUsersCol.insertMany(localUsers, { ordered: true });
    console.log(`  ✓ Inserted ${userInsertResult.insertedCount} users into Atlas.`);

    // 6. Migrate Games (Raw insertion preserves foreign keys and session metadata)
    console.log('\n[Step 6] Migrating Games to Atlas...');
    const gameInsertResult = await atlasGamesCol.insertMany(localGames, { ordered: true });
    console.log(`  ✓ Inserted ${gameInsertResult.insertedCount} games into Atlas.`);

    // 7. Synchronize Production Indexes in Atlas
    console.log('\n[Step 7] Synchronizing Indexes on Atlas...');
    await atlasUsersCol.createIndex({ username: 1 }, { unique: true });
    await atlasUsersCol.createIndex({ email: 1 }, { unique: true });
    await atlasUsersCol.createIndex({ highScore: 1 });
    console.log('  ✓ Atlas Users indexes built (unique username, unique email, highScore).');

    await atlasGamesCol.createIndex({ user: 1, playedAt: -1 });
    await atlasGamesCol.createIndex({ score: -1, playedAt: -1 });
    await atlasGamesCol.createIndex({ gameSessionId: 1 }, { sparse: true });
    console.log('  ✓ Atlas Games compound indexes built.');

    // 8. Post-migration Verification
    console.log('\n[Step 8] Post-migration Verification in Atlas:');
    const finalAtlasUsers = await atlasUsersCol.find({}).toArray();
    const finalAtlasGames = await atlasGamesCol.find({}).toArray();
    console.log(`  Atlas final Users count: ${finalAtlasUsers.length} (expected: 9)`);
    console.log(`  Atlas final Games count: ${finalAtlasGames.length} (expected: 23)`);

    if (finalAtlasUsers.length !== 9 || finalAtlasGames.length !== 23) {
      throw new Error(`Post-migration count mismatch! Atlas has ${finalAtlasUsers.length} users and ${finalAtlasGames.length} games.`);
    }

    // Verify referential integrity
    const finalUserIds = new Set(finalAtlasUsers.map(u => u._id.toString()));
    const orphans = finalAtlasGames.filter(g => !finalUserIds.has(g.user.toString()));
    if (orphans.length > 0) {
      throw new Error(`Integrity error! ${orphans.length} games in Atlas do not reference a valid user.`);
    }
    console.log('  ✓ 100% of Atlas games reference valid user ObjectIds.');

    // Verify key user records
    const kirti = finalAtlasUsers.find(u => u.username === 'Kirti Gupta');
    if (!kirti || kirti.unlockedLevel !== 10 || kirti.highScore !== 4312 || kirti.completedLevels?.length !== 9) {
      throw new Error('Kirti Gupta progression mismatch in Atlas!');
    }
    console.log(`  ✓ Kirti Gupta verified in Atlas: Level ${kirti.unlockedLevel}, High Score ${kirti.highScore}, ${kirti.completedLevels.length} completed stages.`);

    const krishna = finalAtlasUsers.find(u => u.username === 'krishnaa');
    if (!krishna || krishna.unlockedLevel !== 1 || krishna.highScore !== 1118) {
      throw new Error('krishnaa progression mismatch in Atlas!');
    }
    console.log(`  ✓ krishnaa verified in Atlas: Level ${krishna.unlockedLevel}, High Score ${krishna.highScore}.`);

    // Verify local documents were not touched or modified
    const postLocalUserCount = await localUsersCol.countDocuments();
    const postLocalGameCount = await localGamesCol.countDocuments();
    if (postLocalUserCount !== 9 || postLocalGameCount !== 23) {
      throw new Error('Local MongoDB was modified! Safety violation.');
    }
    console.log('  ✓ Local MongoDB verified completely untouched (9 users, 23 games intact).');

    console.log('\n====================================================');
    console.log('MIGRATION COMPLETED SUCCESSFULLY! ✓');
    console.log('====================================================');

  } catch (err) {
    console.error('\nMIGRATION FAILED:', err.message);
    process.exit(1);
  } finally {
    if (localConn) await localConn.close();
    if (atlasConn) await atlasConn.close();
  }
})();
