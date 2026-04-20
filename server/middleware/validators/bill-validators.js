const { body } = require('express-validator');

exports.createBillValidation = [
  body('items')
    .isArray({ min: 1 }).withMessage('Bill must contain at least one item'),
  body('items.*.product_id')
    .isInt({ min: 1 }).withMessage('Valid product_id is required'),
  body('items.*.qty')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('total_amount')
    .isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
  body('discount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Discount must be a positive number'),
  body('payment_method')
    .isIn(['cash', 'upi', 'card', 'udhari']).withMessage('Invalid payment method'),
  body('customer_id')
    .optional({ checkFalsy: true })
    .isInt({ min: 1 }).withMessage('Valid customer_id is required if provided')
];
