const { body, query } = require('express-validator');

const createProductValidation = [
  body('name')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 100 })
    .withMessage('Product name must be under 100 characters'),

  body('sku')
    .optional({ values: 'falsy' })
    .trim()
    .escape()
    .isLength({ max: 50 })
    .withMessage('SKU must be under 50 characters'),

  body('category')
    .optional({ values: 'falsy' })
    .trim()
    .escape()
    .isLength({ max: 50 })
    .withMessage('Category must be under 50 characters'),

  body('buy_price')
    .notEmpty()
    .withMessage('Buy price is required')
    .isFloat({ min: 0.01 })
    .withMessage('Buy price must be a positive number'),

  body('sell_price')
    .notEmpty()
    .withMessage('Sell price is required')
    .isFloat({ min: 0.01 })
    .withMessage('Sell price must be a positive number'),

  body('stock_qty')
    .notEmpty()
    .withMessage('Stock quantity is required')
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),

  body('low_stock_threshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Low stock threshold must be a non-negative integer')
];

const updateProductValidation = [
  body('name')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 100 })
    .withMessage('Product name must be under 100 characters'),

  body('sku')
    .optional({ values: 'falsy' })
    .trim()
    .escape()
    .isLength({ max: 50 })
    .withMessage('SKU must be under 50 characters'),

  body('category')
    .optional({ values: 'falsy' })
    .trim()
    .escape()
    .isLength({ max: 50 })
    .withMessage('Category must be under 50 characters'),

  body('buy_price')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Buy price must be a positive number'),

  body('sell_price')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Sell price must be a positive number'),

  body('stock_qty')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),

  body('low_stock_threshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Low stock threshold must be a non-negative integer')
];

module.exports = { createProductValidation, updateProductValidation };
