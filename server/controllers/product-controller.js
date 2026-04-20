const productModel = require('../models/product-model');

// GET /api/products
const getProducts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;

    const result = await productModel.findAll(req.user.id, {
      search,
      category,
      page: parseInt(page, 10),
      limit: Math.min(parseInt(limit, 10) || 20, 100) // Cap at 100
    });

    return res.status(200).json({
      success: true,
      data: result.data,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      message: null
    });
  } catch (error) {
    console.error('getProducts error:', error.message);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Server error'
    });
  }
};

// GET /api/products/:id
const getProduct = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id, req.user.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
      message: null
    });
  } catch (error) {
    console.error('getProduct error:', error.message);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Server error'
    });
  }
};

// POST /api/products
const createProduct = async (req, res) => {
  try {
    const product = await productModel.create(req.user.id, req.body);

    return res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('createProduct error:', error.message);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Server error'
    });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await productModel.update(req.params.id, req.user.id, req.body);

    if (!product) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('updateProduct error:', error.message);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Server error'
    });
  }
};

// DELETE /api/products/:id (soft delete)
const deleteProduct = async (req, res) => {
  try {
    const product = await productModel.softDelete(req.params.id, req.user.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('deleteProduct error:', error.message);
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Server error'
    });
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
