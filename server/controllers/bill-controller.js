const BillModel = require('../models/bill-model');

exports.createBill = async (req, res, next) => {
  try {
    const { items, total_amount, discount, customer_id, payment_method } = req.body;
    
    // Check if udhari but no customer
    if (payment_method === 'udhari' && !customer_id) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Customer is required for Udhari payment'
      });
    }

    const bill = await BillModel.createBill(
      req.user.id, 
      items, 
      total_amount, 
      discount, 
      customer_id, 
      payment_method
    );

    res.status(201).json({
      success: true,
      data: bill,
      message: 'Bill created successfully'
    });
  } catch (error) {
    // If it's a known error block (e.g. out of stock), handle gracefully
    if (error.message.includes('Not enough stock') || error.message.includes('not found')) {
      return res.status(400).json({
        success: false,
        data: null,
        message: error.message
      });
    }
    next(error);
  }
};

exports.getBills = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const result = await BillModel.findAll(req.user.id, limit, offset);

    res.json({
      success: true,
      data: {
        bills: result.bills,
        total: result.total,
        page,
        totalPages: Math.ceil(result.total / limit) || 1
      },
      message: null
    });
  } catch (error) {
    next(error);
  }
};

exports.getBillById = async (req, res, next) => {
  try {
    const bill = await BillModel.findById(req.params.id, req.user.id);
    
    if (!bill) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Bill not found'
      });
    }

    res.json({
      success: true,
      data: bill,
      message: null
    });
  } catch (error) {
    next(error);
  }
};
