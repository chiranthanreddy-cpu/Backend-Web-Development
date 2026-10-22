const express = require('express');
const bcrypt = require('bcryptjs');
const sessionStore = require('../session/sessionStore');
const userRepository = require('../repositories/userRepository');
const requireSession = require('../middleware/requireSession');
const { COOKIE_NAME, getCookieOptions, getClearCookieOptions } = require('../session/cookieConfig');

const router = express.Router();

const DUMMY_HASH = '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012';

// POST /auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'Email and password are required non-empty strings',
        },
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await userRepository.findByEmail(normalizedEmail);

    if (!user) {
      await bcrypt.compare(password, DUMMY_HASH).catch(() => {});
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    // Create session in server store
    const session = sessionStore.create(user.id);

    // Send signed cookie
    res.cookie(COOKIE_NAME, session.id, getCookieOptions());

    // Return safe user identity only
    return res.status(200).json({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /auth/me
router.get('/me', requireSession, (req, res) => {
  return res.status(200).json({
    data: req.user,
  });
});

// POST /auth/logout
router.post('/logout', (req, res) => {
  const sessionId = req.signedCookies && req.signedCookies[COOKIE_NAME];
  if (sessionId) {
    sessionStore.destroy(sessionId);
  }

  res.clearCookie(COOKIE_NAME, getClearCookieOptions());
  return res.status(204).send();
});

module.exports = router;