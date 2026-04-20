const pool = require('../db');

const CustomerModel = {
  create: async (userId, data) => {
    const res = await pool.query(`
      INSERT INTO customers (user_id, name, phone, address)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [userId, data.name, data.phone, data.address || null]);
    return res.rows[0];
  },

  // Get all customers with their dynamically calculated balance
  // Balance = sum of 'given' (money owed to shop) - sum of 'received' (payments made by customer)
  findAllWithBalances: async (userId) => {
    const res = await pool.query(`
      SELECT 
        c.*, 
        COALESCE(SUM(CASE WHEN ct.type = 'given' THEN ct.amount ELSE 0 END), 0) - 
        COALESCE(SUM(CASE WHEN ct.type = 'received' THEN ct.amount ELSE 0 END), 0) as balance 
      FROM customers c
      LEFT JOIN customer_transactions ct ON c.id = ct.customer_id
      WHERE c.user_id = $1
      GROUP BY c.id
      ORDER BY c.name ASC
    `, [userId]);
    return res.rows;
  },

  findById: async (id, userId) => {
    const res = await pool.query(`
      SELECT 
        c.*, 
        COALESCE(SUM(CASE WHEN ct.type = 'given' THEN ct.amount ELSE 0 END), 0) - 
        COALESCE(SUM(CASE WHEN ct.type = 'received' THEN ct.amount ELSE 0 END), 0) as balance 
      FROM customers c
      LEFT JOIN customer_transactions ct ON c.id = ct.customer_id
      WHERE c.id = $1 AND c.user_id = $2
      GROUP BY c.id
    `, [id, userId]);
    return res.rows.length ? res.rows[0] : null;
  },

  // Record a transaction (payment received or credit given)
  addTransaction: async (customerId, type, amount, notes = '') => {
    const res = await pool.query(`
      INSERT INTO customer_transactions (customer_id, type, amount, notes)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [customerId, type, amount, notes]);
    return res.rows[0];
  },

  // Get transaction history for a customer
  getTransactions: async (customerId) => {
    const res = await pool.query(`
      SELECT ct.*, b.bill_number 
      FROM customer_transactions ct
      LEFT JOIN bills b ON ct.bill_id = b.id
      WHERE ct.customer_id = $1
      ORDER BY ct.created_at DESC
    `, [customerId]);
    return res.rows;
  }
};

module.exports = CustomerModel;
