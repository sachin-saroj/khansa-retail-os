const { pool } = require('../db');

// Helper wrapper to run transactions securely
const runTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const BillModel = {
  // Create bill with atomic sequence, auto profit calculation, and stock decrement
  createBill: async (userId, items, inputTotal, inputDiscount, customerId = null, paymentMethod = 'cash') => {
    return await runTransaction(async (client) => {
      // 1. Generate Atomic Bill Number (e.g., BILL-20231024-0001)
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
      
      const counterRes = await client.query(`
        INSERT INTO bill_counters (user_id, date, last_seq) 
        VALUES ($1, $2, 1) 
        ON CONFLICT (user_id, date) 
        DO UPDATE SET last_seq = bill_counters.last_seq + 1 
        RETURNING last_seq
      `, [userId, today]);
      
      const seq = counterRes.rows[0].last_seq.toString().padStart(4, '0');
      const billNumber = `BILL-${today}-${seq}`;

      let calculatedTotal = 0;
      let totalProfit = 0;
      const billItemsToInsert = [];

      // 2. Validate Items, calculate totals & profit server-side, prepare items array
      for (const item of items) {
        // Lock the product row for update to prevent concurrent stock issues
        const productRes = await client.query(`
          SELECT id, name, sell_price, buy_price, stock_qty 
          FROM products 
          WHERE id = $1 AND user_id = $2 
          FOR UPDATE
        `, [item.product_id, userId]);

        if (productRes.rows.length === 0) {
          throw new Error(`Product ID ${item.product_id} not found.`);
        }

        const product = productRes.rows[0];
        
        // Ensure enough stock
        if (product.stock_qty < item.qty) {
          throw new Error(`Not enough stock for ${product.name}. Available: ${product.stock_qty}, Requested: ${item.qty}`);
        }

        // Subtotals
        const subtotal = Number(product.sell_price) * item.qty;
        calculatedTotal += subtotal;

        // Profit = (Sell Price - Buy Price) * Qty
        const itemProfit = (Number(product.sell_price) - Number(product.buy_price)) * item.qty;
        totalProfit += itemProfit;

        // Decrement stock
        await client.query(`
          UPDATE products 
          SET stock_qty = stock_qty - $1, updated_at = CURRENT_TIMESTAMP 
          WHERE id = $2
        `, [item.qty, product.id]);

        billItemsToInsert.push({
          product_id: product.id,
          qty: item.qty,
          unit_price: product.sell_price,
          subtotal: subtotal
        });
      }

      // Security check: Client total should loosely match our calculated total
      // E.g. we use calculatedTotal, discount is applied.
      const finalTotal = calculatedTotal - Number(inputDiscount || 0);

      // Adjust total profit based on the final discount applied
      const finalProfit = totalProfit - Number(inputDiscount || 0);

      // 3. Create the Bill (schema: subtotal, discount, total, profit, is_udhari)
      const isUdhari = paymentMethod === 'udhari';
      const billRes = await client.query(`
        INSERT INTO bills (user_id, bill_number, customer_id, subtotal, discount, total, profit, is_udhari)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [userId, billNumber, customerId, calculatedTotal, inputDiscount || 0, finalTotal, finalProfit, isUdhari]);

      const bill = billRes.rows[0];

      // 4. Create Bill Items
      for (const bItem of billItemsToInsert) {
        await client.query(`
          INSERT INTO bill_items (bill_id, product_id, qty, unit_price, subtotal)
          VALUES ($1, $2, $3, $4, $5)
        `, [bill.id, bItem.product_id, bItem.qty, bItem.unit_price, bItem.subtotal]);
      }

      if (paymentMethod === 'udhari' && customerId) {
        await client.query(`
          INSERT INTO customer_transactions (customer_id, type, amount, bill_id, note)
          VALUES ($1, 'credit', $2, $3, 'Bill Udhari')
        `, [customerId, finalTotal, bill.id]);
      }

      return bill;
    });
  },

  findAll: async (userId, limit = 20, offset = 0) => {
    const res = await pool.query(`
      SELECT b.*, c.name as customer_name
      FROM bills b
      LEFT JOIN customers c ON b.customer_id = c.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);
    
    const countRes = await pool.query('SELECT COUNT(*) FROM bills WHERE user_id = $1', [userId]);
    return {
      bills: res.rows,
      total: parseInt(countRes.rows[0].count, 10)
    };
  },

  findById: async (id, userId) => {
    const billRes = await pool.query(`
      SELECT b.*, c.name as customer_name, c.phone as customer_phone
      FROM bills b
      LEFT JOIN customers c ON b.customer_id = c.id
      WHERE b.id = $1 AND b.user_id = $2
    `, [id, userId]);

    if (billRes.rows.length === 0) return null;

    const itemsRes = await pool.query(`
      SELECT bi.*, p.name as product_name
      FROM bill_items bi
      JOIN products p ON bi.product_id = p.id
      WHERE bi.bill_id = $1
    `, [id]);

    return {
      ...billRes.rows[0],
      items: itemsRes.rows
    };
  }
};

module.exports = BillModel;
