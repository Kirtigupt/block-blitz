import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Generate a signed JWT token for a user
 */
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'dev_fallback_secret_block_blitz_key_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id: userId }, secret, { expiresIn });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, email, and password.'
      });
    }

    const trimmedUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    // 2. Validate field formats
    if (trimmedUsername.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters long.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // 3. Check for existing username or email
    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    const existingUsername = await User.findOne({
      username: { $regex: new RegExp(`^${trimmedUsername}$`, 'i') }
    });
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: 'This username is already taken. Please choose another.'
      });
    }

    // 4. Create new user (password is automatically hashed in pre('save'))
    const user = await User.create({
      username: trimmedUsername,
      email: cleanEmail,
      password
    });

    // 5. Generate authentication token
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        highScore: user.highScore,
        totalGamesPlayed: user.totalGamesPlayed,
        totalLinesCleared: user.totalLinesCleared,
        unlockedLevel: user.unlockedLevel || 1,
        currentLevel: user.currentLevel || 1,
        completedLevels: user.completedLevels || [],
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while registering user.',
      error: error.message
    });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { usernameOrEmail, email, username, password } = req.body;

    const identifier = (usernameOrEmail || email || username || '').trim();

    // 1. Validate inputs
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username or email along with your password.'
      });
    }

    // 2. Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: { $regex: new RegExp(`^${identifier}$`, 'i') } }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password.'
      });
    }

    // 3. Verify password using schema comparison method
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password.'
      });
    }

    // 4. Generate authentication token
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        highScore: user.highScore,
        totalGamesPlayed: user.totalGamesPlayed,
        totalLinesCleared: user.totalLinesCleared,
        unlockedLevel: user.unlockedLevel || 1,
        currentLevel: user.currentLevel || 1,
        completedLevels: user.completedLevels || [],
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login.',
      error: error.message
    });
  }
};

/**
 * @desc    Get current authenticated user's profile
 * @route   GET /api/auth/me
 * @access  Private (Requires valid JWT)
 */
export const getMe = async (req, res) => {
  try {
    // req.user is attached by protect middleware
    return res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('getMe error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error fetching profile.',
      error: error.message
    });
  }
};

/**
 * @desc    Update authenticated user's level progression
 * @route   PUT /api/auth/progression
 * @access  Private (Requires JWT)
 */
export const updateProgression = async (req, res) => {
  try {
    const { completedLevel, currentLevel } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    // 1. If completedLevel is supplied, validate it
    if (completedLevel !== undefined && completedLevel !== null) {
      const parsedCompleted = Number(completedLevel);
      if (isNaN(parsedCompleted) || parsedCompleted < 1 || parsedCompleted > 100) {
        return res.status(400).json({
          success: false,
          message: 'completedLevel must be an integer between 1 and 100.'
        });
      }

      // Progression Validation: A user can only complete an already unlocked level
      if (parsedCompleted > user.unlockedLevel) {
        return res.status(400).json({
          success: false,
          message: `Cannot complete level ${parsedCompleted} because it is not unlocked yet.`
        });
      }

      // Add to completedLevels if not already present
      if (!user.completedLevels.includes(parsedCompleted)) {
        user.completedLevels.push(parsedCompleted);
      }

      // Unlock next level (capped at 100)
      const nextUnlocked = Math.min(100, Math.max(user.unlockedLevel, parsedCompleted + 1));
      user.unlockedLevel = nextUnlocked;
    }

    // 2. If currentLevel is supplied, validate it
    if (currentLevel !== undefined && currentLevel !== null) {
      const parsedCurrent = Number(currentLevel);
      if (isNaN(parsedCurrent) || parsedCurrent < 1 || parsedCurrent > 100) {
        return res.status(400).json({
          success: false,
          message: 'currentLevel must be an integer between 1 and 100.'
        });
      }

      // Current level cannot exceed unlocked level
      if (parsedCurrent > user.unlockedLevel) {
        return res.status(400).json({
          success: false,
          message: `Cannot set current level to ${parsedCurrent} because it exceeds unlocked level ${user.unlockedLevel}.`
        });
      }

      user.currentLevel = parsedCurrent;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Progression updated successfully',
      progression: {
        unlockedLevel: user.unlockedLevel,
        currentLevel: user.currentLevel,
        completedLevels: user.completedLevels
      }
    });
  } catch (error) {
    console.error('updateProgression error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while updating progression.',
      error: error.message
    });
  }
};
