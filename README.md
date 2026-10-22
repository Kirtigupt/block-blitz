# BLOCK BLITZ ⚡

A modern, full-stack block puzzle game built with **React + Vite** on the frontend and **Node.js + Express + MongoDB** on the backend.

---

## 🎮 Game Features

- **8x8 Classic Grid**: Sleek responsive board with glassmorphic neon arcade styling.
- **Three Shape Dock**: Spawns 3 random polyomino pieces; refills automatically when all are placed.
- **Dual Placement Controls**:
  - **Click to Select & Click to Place**: Pick up a block, hover over the grid for a ghost preview, and click to place.
  - **Drag and Drop**: Drag blocks directly from the tray onto the grid.
  - **Unplayable Indication**: Shapes that cannot fit anywhere on the current board are automatically dimmed.
- **Line Clears & Combos**: Full rows and columns are cleared simultaneously with flash animations and sound chimes.
- **Scoring & Streak Multipliers**: Points for blocks placed, progressive line clear bonuses, and combo streak multipliers (`STREAK x2 🔥`).
- **Game-Over Detection**: Checks if any remaining block can fit anywhere on the board.
- **Audio Synthesizer**: Web Audio API sound effects for zero-dependency sounds (select, drop, chime, combo, game over) with a mute toggle.

---

## 🌐 Full-Stack Features

- **JWT Authentication**: Player sign-up and sign-in with secure 10-round bcrypt password hashing.
- **Guest / Offline Mode**: Players can enjoy the full game offline without signing up.
- **Cloud Score Sync**: When an authenticated player finishes a game, their score is automatically recorded to MongoDB (strictly once per game session).
- **Player Career Stats & History**: View personal best score, total games played, total lines cleared, and a scrollable log of recent matches.
- **Global Leaderboard**: Live ranking of top players worldwide with gold, silver, and bronze badges.

---

## 🚀 Running the Full Stack Application

### 1. Start the Backend API Server
```bash
# Open a terminal in the server folder
cd server
npm install
npm run dev
```
The backend API starts at **`http://localhost:5000`** and connects to MongoDB.

### 2. Start the Frontend React Client
```bash
# In the project root folder
npm install
npm run dev
```
The frontend starts at **`http://localhost:5173`**.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `1` | Select 1st block in dock |
| `2` | Select 2nd block in dock |
| `3` | Select 3rd block in dock |
| `Esc` | Deselect active block |
| `R` | Restart game |
| `M` | Mute / Unmute sound effects |

---

## 📁 Architecture Overview

```text
Block-blitz/
├── server/
│   ├── config/
│   │   └── db.js                  # MongoDB connection via Mongoose
│   ├── controllers/
│   │   ├── authController.js      # Register, Login, and GetMe
│   │   ├── gameController.js      # Save game, History, and Stats
│   │   └── leaderboardController.js # Top 10 Global Leaderboard
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT Bearer verification
│   ├── models/
│   │   ├── Game.js                # Game session schema & compound indexes
│   │   └── User.js                # User schema with bcrypt password hashing
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth endpoints
│   │   ├── gameRoutes.js          # /api/games endpoints
│   │   └── leaderboardRoutes.js   # /api/leaderboard endpoints
│   ├── .env.example
│   └── index.js                   # Express server entry point
│
└── src/
    ├── components/
    │   ├── AuthModal.jsx          # Login & Register modal dialog
    │   ├── BlockPiece.jsx         # Miniature shape preview with drag & select
    │   ├── BlockTray.jsx          # Bottom tray holding 3 shapes
    │   ├── GameGrid.jsx           # 8x8 Board with ghost preview & drop handling
    │   ├── GameOverModal.jsx      # Game Over screen with cloud sync confirmation
    │   ├── GridCell.jsx           # Individual cell with glossy 3D bevels
    │   ├── Header.jsx             # Score, Streak, Leaderboard & User Profile buttons
    │   ├── HowToPlayModal.jsx     # Interactive gameplay rules
    │   ├── LeaderboardModal.jsx   # Global rankings modal with rank badges
    │   ├── PlayerProfileModal.jsx # Career stats and recent games history
    │   └── ScoreNotification.jsx  # Floating popup score text
    ├── constants/
    │   └── blocks.js              # Polyomino matrices and color themes
    ├── utils/
    │   ├── api.js                 # Reusable API service & JWT token manager
    │   ├── gameLogic.js           # Core puzzle rules, line clear & validation
    │   └── soundEffects.js        # Web Audio API sound synthesizer
    ├── App.css                    # Futuristic responsive glassmorphic stylesheet
    ├── App.jsx                    # Central game engine and auth coordinator
    └── main.jsx                   # React mount point
```
