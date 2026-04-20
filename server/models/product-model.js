const db = require('../db');

// Get all products for a user (paginated, with optional search and category filter)
const findAll = async (userId, { search, category, page = 1, limit = 20 }) => {
  const offset = (page - 1) * limit;
  let conditions = ['p.user_id = $1', 'p.is_active = TRUE'];
  let params = [userId];
  let paramIndex = 2;

  if (search) {
    conditions.push(`(LOWER(p.name) LIKE $${paramIndex} OR LOWER(p.sku) LIKE $${paramIndex})`);
    params.push(`%${search.toLowerCase()}%`);
    paramIndex++;
  }

  if (category) {
    conditions.push(`LOWER(p.category) = $${paramIndex}`);
    params.push(category.toLowerCase());
    paramIndex++;
  }

  const whereClause = conditions.join(' AND ');

  // Get total count
  const countResult = await db.query(
    `SELECT COUNT(*) FROM products p WHERE ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  // Get paginated data
  params.push(limit, offset);
  const dataResult = await db.query(
    `SELECT p.id, p.name, p.sku, p.category, p.buy_price, p.sell_price,
            p.stock_qty, p.low_stock_threshold, p.created_at
     FROM products p
     WHERE ${whereClause}
     ORDER BY p.created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    params
  );

  return {
    data: dataResult.rows,
    total,
    page: parseInt(page, 10),
    totalPages: Math.ceil(total / limit)
  };
};

// Get single product by ID, scoped to user
const findById = async (id, userId) => {
  const result = await db.query(
    `SELECT id, name, sku, category, buy_price, sell_price,
            stock_qty, low_stock_threshold, is_active, created_at
     FROM products
     WHERE id = $1 AND user_id = $2 AND is_active = TRUE`,
    [id, userId]
  );
  return result.rows[0] || null;
};

// Create a new product
const create = async (userId, productData) => {
  const { name, sku, category, buy_price, sell_price, stock_qty, low_stock_threshold } = productData;

  const result = await db.query(
    `INSERT INTO products (user_id, name, sku, category, buy_price, sell_price, stock_qty, low_stock_threshold)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, name, sku, category, buy_price, sell_price, stock_qty, low_stock_threshold, created_at`,
    [userId, name, sku || null, category || null, buy_price, sell_price, stock_qty, low_stock_threshold || 5]
  );

  return result.rows[0];
};

// Update a product
const update = async (id, userId, updates) => {
  // Build dynamic SET clause from provided fields only
  const allowedFields = ['name', 'sku', 'category', 'buy_price', 'sell_price', 'stock_qty', 'low_stock_threshold'];
  const setClauses = [];
  const params = [];
  let paramIndex = 1;

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      setClauses.push(`${field} = $${paramIndex}`);
      params.push(updates[field]);
      paramIndex++;
    }
  }

  if (setClauses.length === 0) {
    return findById(id, userId);
  }

  params.push(id, userId);

  const result = await db.query(
    `UPDATE products
     SET ${setClauses.join(', ')}
     WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1} AND is_active = TRUE
     RETURNING id, name, sku, category, buy_price, sell_price, stock_qty, low_stock_threshold, created_at`,
    params
  );

  return result.rows[0] || null;
};

// Soft delete
const softDelete = async (id, userId) => {
  const result = await db.query(
    `UPDATE products SET is_active = FALSE
     WHERE id = $1 AND user_id = $2 AND is_active = TRUE
     RETURNING id`,
    [id, userId]
  );
  return result.rows[0] || null;
};

module.exports = { findAll, findById, create, update, softDelete };
