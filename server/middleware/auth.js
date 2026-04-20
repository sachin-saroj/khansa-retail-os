const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request — all downstream queries use this
    req.user = {
      id: decoded.id,
      shop_name: decoded.shop_name
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Token expired. Please refresh.'
      });
    }
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Invalid token.'
    });
  }
};

module.exports = { verifyToken };
