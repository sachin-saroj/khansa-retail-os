const { body } = require('express-validator');

const registerValidation = [
  body('shop_name')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Shop name is required')
    .isLength({ max: 100 })
    .withMessage('Shop name must be under 100 characters'),

  body('owner_name')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Owner name is required')
    .isLength({ max: 100 })
    .withMessage('Owner name must be under 100 characters'),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\d{10}$/)
    .withMessage('Phone must be a 10-digit number'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

const loginValidation = [
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\d{10}$/)
    .withMessage('Phone must be a 10-digit number'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

module.exports = { registerValidation, loginValidation };
