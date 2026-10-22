import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    highScore: {
      type: Number,
      default: 0,
      min: 0,
      index: true
    },
    totalGamesPlayed: {
      type: Number,
      default: 0,
      min: 0
    },
    totalLinesCleared: {
      type: Number,
      default: 0,
      min: 0
    },
    unlockedLevel: {
      type: Number,
      default: 1,
      min: 1,
      max: 100
    },
    currentLevel: {
      type: Number,
      default: 1,
      min: 1,
      max: 100
    },
    completedLevels: {
      type: [Number],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving if modified or new
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to compare a plain text candidate password with the stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password hash when returning user object
userSchema.methods.toJSON = function () {
  const userObj = this.toObject();
  delete userObj.password;
  return userObj;
};

export const User = mongoose.model('User', userSchema);
export default User;
