const express = require('express');
const router = express.Router();
const billController = require('../controllers/bill-controller');
const { verifyToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createBillValidation } = require('../middleware/validators/bill-validators');

// All bill routes require authentication
router.use(verifyToken);

router.post('/', createBillValidation, validate, billController.createBill);
router.get('/', billController.getBills);
router.get('/:id', billController.getBillById);

module.exports = router;
