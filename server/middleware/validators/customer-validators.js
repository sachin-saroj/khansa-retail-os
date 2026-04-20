const { body } = require('express-validator');

exports.createCustomerValidation = [
  body('name').trim().notEmpty().withMessage('Customer name is required'),
  body('phone')
    .optional({ checkFalsy: true })
    .matches(/^\d{10}$/).withMessage('Valid 10-digit phone number structure required'),
  body('address')
    .optional()
    .trim()
];

exports.transactionValidation = [
  body('type').isIn(['given', 'received']).withMessage('Transaction type must be given or received'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
  body('notes').optional().trim()
];
