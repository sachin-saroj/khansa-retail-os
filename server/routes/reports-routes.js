const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports-controller');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);
router.get('/export-csv', reportsController.exportBills);

module.exports = router;
