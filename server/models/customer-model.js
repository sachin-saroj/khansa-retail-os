const { pool } = require('../db');

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
  // Supports pagination (LIMIT/OFFSET) and search (ILIKE on name/phone)
  findAllWithBalances: async (userId, { page = 1, limit = 20, search = '' } = {}) => {
    const offset = (page - 1) * limit;

    const searchCondition = search
      ? `AND (c.name ILIKE $2 OR c.phone ILIKE $2)`
      : '';

    const values = search
      ? [userId, `%${search}%`, limit, offset]
      : [userId, limit, offset];

    const query = `
      SELECT
        c.id,
        c.name,
        c.phone,
        c.address,
        c.created_at,
        COALESCE(SUM(
          CASE
            WHEN b.payment_type = 'udhari' THEN b.total
            WHEN b.payment_type = 'udhari_payment' THEN -b.total
            ELSE 0
          END
        ), 0) AS balance,
        COUNT(*) OVER() AS total_count
      FROM customers c
      LEFT JOIN bills b ON b.customer_id = c.id AND b.user_id = $1
      WHERE c.user_id = $1
      ${searchCondition}
      GROUP BY c.id, c.name, c.phone, c.address, c.created_at
      ORDER BY c.name ASC
      LIMIT $${search ? 3 : 2}
      OFFSET $${search ? 4 : 3}
    `;

    const result = await pool.query(query, values);

    const total = result.rows.length > 0
      ? parseInt(result.rows[0].total_count)
      : 0;

    return {
      customers: result.rows.map(({ total_count, ...customer }) => customer),
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    };
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
  addTransaction: async (customerId, type, amount, note = '') => {
    const res = await pool.query(`
      INSERT INTO customer_transactions (customer_id, type, amount, note)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [customerId, type, amount, note]);
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
