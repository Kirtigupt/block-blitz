import mongoose from 'mongoose';

/**
 * Connect to MongoDB database using Mongoose
 */
export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/block-blitz';

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Safe progression migration for existing accounts without progression fields
    try {
      const usersCol = conn.connection.db.collection('users');
      // Preserve Kirti Gupta's existing Level 10 achievement
      await usersCol.updateOne(
        { username: { $regex: /^Kirti Gupta$/i }, unlockedLevel: { $exists: false } },
        {
          $set: {
            unlockedLevel: 10,
            currentLevel: 10,
            completedLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9]
          }
        }
      );
      // Ensure all other existing users have default level progression fields
      await usersCol.updateMany(
        { unlockedLevel: { $exists: false } },
        {
          $set: {
            unlockedLevel: 1,
            currentLevel: 1,
            completedLevels: []
          }
        }
      );
    } catch (migErr) {
      console.warn('Progression migration warning:', migErr.message);
    }
  } catch (error) {
    console.error(`⚠️  MongoDB Connection Error: ${error.message}`);
    console.warn('ℹ️  Ensure your local MongoDB service is running, or set MONGODB_URI in server/.env to a valid connection string.');
  }
};
