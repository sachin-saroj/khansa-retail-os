const CustomerModel = require('../models/customer-model');

exports.createCustomer = async (req, res, next) => {
  try {
    const customer = await CustomerModel.create(req.user.id, req.body);
    // Include 0 balance for newly created customer
    customer.balance = 0;
    
    res.status(201).json({
      success: true,
      data: customer,
      message: 'Customer created successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.getCustomers = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const search = (req.query.search || '').trim();

    const result = await CustomerModel.findAllWithBalances(req.user.id, {
      page,
      limit,
      search
    });

    res.json({
      success: true,
      data: result.customers,
      pagination: {
        total:      result.total,
        page:       result.page,
        limit:      result.limit,
        totalPages: result.totalPages,
        hasNext:    result.hasNextPage,
        hasPrev:    result.hasPrevPage
      },
      message: null
    });
  } catch (error) {
    next(error);
  }
};

exports.getCustomerDetails = async (req, res, next) => {
  try {
    const customer = await CustomerModel.findById(req.params.id, req.user.id);
    if (!customer) {
      return res.status(404).json({
        success: false, data: null, message: 'Customer not found'
      });
    }

    const transactions = await CustomerModel.getTransactions(customer.id);
    
    res.json({
      success: true,
      data: {
        ...customer,
        transactions
      },
      message: null
    });
  } catch (error) {
    next(error);
  }
};

exports.addTransaction = async (req, res, next) => {
  try {
    // First ensure customer belongs to user
    const customer = await CustomerModel.findById(req.params.id, req.user.id);
    if (!customer) {
      return res.status(404).json({
        success: false, data: null, message: 'Customer not found'
      });
    }

    const { type, amount, note } = req.body;
    const transaction = await CustomerModel.addTransaction(customer.id, type, amount, note);

    res.status(201).json({
      success: true,
      data: transaction,
      message: `Payment ${type === 'received' ? 'received successfully' : 'logged as credit'}`
    });
  } catch (error) {
    next(error);
  }
};
