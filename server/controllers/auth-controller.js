const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db');

// Helper: hash a refresh token for DB storage
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Helper: generate access token (15 min)
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, shop_name: user.shop_name },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

// Helper: generate refresh token (7 days)
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

// Helper: set refresh token as httpOnly cookie
const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/auth'
  });
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { shop_name, owner_name, phone, password } = req.body;

    // Check if phone already registered
    const existing = await db.query(
      'SELECT id FROM users WHERE phone = $1',
      [phone]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        data: null,
        message: 'Phone number already registered'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert user
    const result = await db.query(
      `INSERT INTO users (shop_name, owner_name, phone, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, shop_name, owner_name, phone, created_at`,
      [shop_name, owner_name, phone, password_hash]
    );

    const user = result.rows[0];

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token hash in DB
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, tokenHash, expiresAt]
    );

    // Set refresh token as httpOnly cookie
    setRefreshCookie(res, refreshToken);

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          shop_name: user.shop_name,
          owner_name: user.owner_name,
          phone: user.phone
        },
        accessToken
      },
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('register error:', error.message);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Server error'
    });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Find user
    const result = await db.query(
      'SELECT id, shop_name, owner_name, phone, password_hash FROM users WHERE phone = $1',
      [phone]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Invalid phone or password'
      });
    }

    const user = result.rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Invalid phone or password'
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token hash in DB
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, tokenHash, expiresAt]
    );

    // Set refresh token as httpOnly cookie
    setRefreshCookie(res, refreshToken);

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          shop_name: user.shop_name,
          owner_name: user.owner_name,
          phone: user.phone
        },
        accessToken
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('login error:', error.message);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Server error'
    });
  }
};

// POST /api/auth/refresh
const refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'No refresh token'
      });
    }

    // Verify JWT signature
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Invalid or expired refresh token'
      });
    }

    // Check token hash in DB — must exist and not be revoked
    const tokenHash = hashToken(token);
    const result = await db.query(
      `SELECT id FROM refresh_tokens
       WHERE token_hash = $1 AND user_id = $2 AND revoked = FALSE AND expires_at > NOW()`,
      [tokenHash, decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Refresh token revoked or expired'
      });
    }

    // Fetch user info for new access token
    const userResult = await db.query(
      'SELECT id, shop_name, owner_name, phone FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'User not found'
      });
    }

    const user = userResult.rows[0];
    const accessToken = generateAccessToken(user);

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          shop_name: user.shop_name,
          owner_name: user.owner_name,
          phone: user.phone
        },
        accessToken
      },
      message: null
    });
  } catch (error) {
    console.error('refresh error:', error.message);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Server error'
    });
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      // Revoke the refresh token in DB
      const tokenHash = hashToken(token);
      await db.query(
        'UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = $1',
        [tokenHash]
      );
    }

    // Clear the cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth'
    });

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('logout error:', error.message);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Server error'
    });
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { shop_name, owner_name, phone } = req.body;
    const userId = req.user.id;

    // Optional phone uniqueness check
    if (phone) {
      const existing = await db.query('SELECT id FROM users WHERE phone = $1 AND id != $2', [phone, userId]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ success: false, data: null, message: 'Phone number already registered' });
      }
    }

    const result = await db.query(
      `UPDATE users
       SET shop_name = COALESCE($1, shop_name),
           owner_name = COALESCE($2, owner_name),
           phone = COALESCE($3, phone)
       WHERE id = $4
       RETURNING id, shop_name, owner_name, phone`,
      [shop_name, owner_name, phone, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, data: null, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('updateProfile error:', error.message);
    return res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
};

module.exports = { register, login, refresh, logout, updateProfile };
