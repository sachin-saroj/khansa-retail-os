const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createProductValidation, updateProductValidation } = require('../middleware/validators/product-validators');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/product-controller');

// All product routes are protected
router.use(verifyToken);

// GET /api/products
router.get('/', getProducts);

// GET /api/products/:id
router.get('/:id', getProduct);

// POST /api/products
router.post('/', createProductValidation, validate, createProduct);

// PUT /api/products/:id
router.put('/:id', updateProductValidation, validate, updateProduct);

// DELETE /api/products/:id (soft delete)
router.delete('/:id', deleteProduct);

module.exports = router;
