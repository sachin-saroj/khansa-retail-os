const rateLimit = require('express-rate-limit');

// Rate limiter for auth routes — 10 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    message: 'Too many attempts. Try again after 15 minutes.'
  }
});

module.exports = { authLimiter };
