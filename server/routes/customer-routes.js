const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer-controller');
const { verifyToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createCustomerValidation, transactionValidation } = require('../middleware/validators/customer-validators');

// All customer routes require authentication
router.use(verifyToken);

router.post('/', createCustomerValidation, validate, customerController.createCustomer);
router.get('/', customerController.getCustomers);
router.get('/:id', customerController.getCustomerDetails);
router.post('/:id/transactions', transactionValidation, validate, customerController.addTransaction);

module.exports = router;
