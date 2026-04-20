const { validationResult } = require('express-validator');

// Generic validation error handler — use after express-validator chains
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      data: null,
      message: errors.array()[0].msg
    });
  }

  next();
};

module.exports = { validate };
