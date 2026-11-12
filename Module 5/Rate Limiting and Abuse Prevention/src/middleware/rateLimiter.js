'use strict';

const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.setHeader('Retry-After', Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000));
    res.status(429).json({
      error: 'Too many requests, please try again later.',
    });
  },

  // In-memory storage keeps counters separately in each Node.js instance.
  // In a multi-instance deployment behind a load balancer, use rate-limit-redis
  // with a shared Redis connection so all instances enforce the same IP limits.
});

module.exports = authLimiter;
