const express = require('express');
const router = express.Router();
const { register, login, refresh, logout, updateProfile } = require('../controllers/auth-controller');
const { verifyToken } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validators/auth-validators');
const { validate } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rate-limiter');

// Apply rate limiter to all auth routes
router.use(authLimiter);

// POST /api/auth/register
router.post('/register', registerValidation, validate, register);

// POST /api/auth/login
router.post('/login', loginValidation, validate, login);

// POST /api/auth/refresh
router.post('/refresh', refresh);

// POST /api/auth/logout
router.post('/logout', logout);


// User Profile (Protected)
router.put('/profile', verifyToken, updateProfile);

module.exports = router;
