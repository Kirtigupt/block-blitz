/**
 * API Service for BLOCK BLITZ
 * Handles HTTP requests, JWT token management, and backend communication.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const TOKEN_KEY = 'block_blitz_token';

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // LocalStorage might be disabled
  }
};

export const clearToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Ignore
  }
};

/**
 * Generic fetch wrapper with auth header & error handling
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // If token is invalid or expired, clear it
      if (response.status === 401 && token) {
        clearToken();
      }
      const errorMsg = data.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      const connError = new Error('Cannot connect to server. Please ensure the backend is running.');
      connError.status = 0;
      throw connError;
    }
    throw err;
  }
}

/* ==================== AUTHENTICATION APIS ==================== */

export const apiRegister = async (username, email, password) => {
  return await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password })
  });
};

export const apiLogin = async (usernameOrEmail, password) => {
  return await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ usernameOrEmail, password })
  });
};

export const apiGetMe = async () => {
  return await request('/api/auth/me', {
    method: 'GET'
  });
};

export const apiUpdateProgression = async ({ completedLevel, currentLevel }) => {
  return await request('/api/auth/progression', {
    method: 'PUT',
    body: JSON.stringify({ completedLevel, currentLevel })
  });
};

/* ==================== GAME RECORD APIS ==================== */

export const apiSaveGame = async (scoreOrObj, linesCleared, maxStreak, gameSessionId) => {
  let body = {};
  if (typeof scoreOrObj === 'object' && scoreOrObj !== null) {
    body = scoreOrObj;
  } else {
    body = { score: scoreOrObj, linesCleared, maxStreak, gameSessionId };
  }
  return await request('/api/games', {
    method: 'POST',
    body: JSON.stringify(body)
  });
};

export const apiGetMyHistory = async () => {
  return await request('/api/games/my-history', {
    method: 'GET'
  });
};

export const apiGetMyStats = async () => {
  return await request('/api/games/my-stats', {
    method: 'GET'
  });
};

/* ==================== LEADERBOARD APIS ==================== */

export const apiGetGlobalLeaderboard = async (limit = 10) => {
  return await request(`/api/leaderboard/global?limit=${limit}`, {
    method: 'GET'
  });
};
