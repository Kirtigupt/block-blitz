import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';

// Load environment variables from .env if present
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Connect to MongoDB
connectDB();

// CORS configuration supporting local dev and deployed frontend environments
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((u) => u.trim().replace(/\/$/, '')) : [])
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, '');
      if (allowedOrigins.includes(cleanOrigin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Express JSON and URL-encoded body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'BLOCK BLITZ API is running'
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 BLOCK BLITZ Server listening on http://localhost:${PORT}`);
  console.log(`🌐 CORS configured for frontend at: ${CLIENT_URL}`);
  console.log(`🩺 Health check available at: http://localhost:${PORT}/api/health`);
});
