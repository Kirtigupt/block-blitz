import React, { useState } from 'react';
import { X, Lock, Mail, User, AlertCircle, Loader2, ArrowRight, ShieldCheck, Play } from 'lucide-react';
import { apiLogin, apiRegister, setToken } from '../utils/api';

export const AuthModal = ({ onClose, onAuthSuccess, onContinueAsGuest, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setErrorMessage('');
  };

  const handleSwitchMode = (newMode) => {
    setMode(newMode);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (mode === 'register') {
      if (username.trim().length < 3) {
        setErrorMessage('Username must be at least 3 characters.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }
    } else {
      if (!username.trim()) {
        setErrorMessage('Please enter your username or email.');
        return;
      }
      if (!password) {
        setErrorMessage('Please enter your password.');
        return;
      }
    }

    setLoading(true);

    try {
      let res;
      if (mode === 'register') {
        res = await apiRegister(username.trim(), email.trim(), password);
      } else {
        res = await apiLogin(username.trim(), password);
      }

      if (res.token && res.user) {
        setToken(res.token);
        const isNewRegistration = mode === 'register';
        onAuthSuccess(res.user, isNewRegistration);
        onClose();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <div className="auth-card" onClick={(e) => e.stopPropagation()}>
        {/* Top Header with Pilot Badge and Aligned Close Button */}
        <div className="auth-header">
          <div className="auth-brand-badge" id="auth-modal-title">
            <ShieldCheck size={13} className="auth-badge-icon" />
            <span>PILOT AUTHENTICATION</span>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Modern Segmented Control for Sign In / Create Account */}
        <div className="auth-tabs-container">
          <div className="auth-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => handleSwitchMode('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => handleSwitchMode('register')}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Error Feedback Banner */}
        {errorMessage && (
          <div className="auth-error-banner" role="alert">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="auth-username" className="form-label">
              {mode === 'login' ? 'Username or Email' : 'Username'}
            </label>
            <div className="input-box">
              <User size={18} className="input-icon" />
              <input
                id="auth-username"
                type="text"
                className="form-input"
                placeholder={mode === 'login' ? 'Enter username or email' : 'Choose a pilot username'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                autoFocus
                autoComplete="username"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="auth-email" className="form-label">Email Address</label>
              <div className="input-box">
                <Mail size={18} className="input-icon" />
                <input
                  id="auth-email"
                  type="email"
                  className="form-input"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-password" className="form-label">Password</label>
            <div className="input-box">
              <Lock size={18} className="input-icon" />
              <input
                id="auth-password"
                type="password"
                className="form-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="spinning-icon" />
                <span>{mode === 'login' ? 'Signing in...' : 'Creating Account...'}</span>
              </>
            ) : (
              <>
                <span>{mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Subtle Visual Divider */}
        <div className="auth-divider">
          <span>OR</span>
        </div>

        {/* Secondary Guest Continue Action */}
        <div className="auth-footer">
          <button
            type="button"
            className="guest-continue-btn"
            onClick={() => {
              if (onContinueAsGuest) {
                onContinueAsGuest();
              } else {
                onClose();
              }
            }}
          >
            <Play size={13} fill="currentColor" />
            <span>Continue as Guest (Offline Mode)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
