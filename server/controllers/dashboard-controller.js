const pool = require('../db');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { range = 'daily' } = req.query; // daily | weekly | monthly
    
    let dateFilterClause = 'DATE(b.created_at) = CURRENT_DATE';
    if (range === 'weekly') dateFilterClause = "b.created_at >= CURRENT_DATE - INTERVAL '6 days'";
    if (range === 'monthly') dateFilterClause = "b.created_at >= CURRENT_DATE - INTERVAL '29 days'";

    // 1. Sales & Profit based on Range
    const salesRes = await pool.query(`
      SELECT 
        COALESCE(SUM(b.total), 0) as range_sales,
        COALESCE(SUM(b.profit), 0) as range_profit,
        COUNT(b.id) as bills_count
      FROM bills b
      WHERE b.user_id = $1 AND ${dateFilterClause}
    `, [userId]);

    // 2. Low Stock Count (always current snapshot)
    const stockRes = await pool.query(`
      SELECT COUNT(id) as low_stock_items
      FROM products
      WHERE user_id = $1 AND stock_qty <= low_stock_threshold AND is_active = true
    `, [userId]);

    // 3. Current Total Udhari in Market
    const udhariRes = await pool.query(`
      WITH CustomerBalances AS (
        SELECT c.id,
          COALESCE(SUM(CASE WHEN ct.type = 'credit' THEN ct.amount ELSE 0 END), 0) - 
          COALESCE(SUM(CASE WHEN ct.type = 'payment' THEN ct.amount ELSE 0 END), 0) as balance 
        FROM customers c
        LEFT JOIN customer_transactions ct ON c.id = ct.customer_id
        WHERE c.user_id = $1
        GROUP BY c.id
      )
      SELECT COALESCE(SUM(balance), 0) as total_market_udhari
      FROM CustomerBalances WHERE balance > 0
    `, [userId]);

    // 4. Sales chart data (Always last 7 days for the chart regardless of range filter)
    const chartRes = await pool.query(`
      SELECT DATE(created_at) as date, SUM(total) as sales, SUM(profit) as profit
      FROM bills WHERE user_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '6 days'
      GROUP BY DATE(created_at) ORDER BY DATE(created_at) ASC
    `, [userId]);

    const salesChart = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dStr = d.toISOString().slice(0, 10);
      const found = chartRes.rows.find(r => r.date.toISOString().slice(0, 10) === dStr);
      salesChart.push({
        date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        sales: found ? Number(found.sales) : 0,
        profit: found ? Number(found.profit) : 0
      });
    }

    // 5. Top 5 Selling Products (based on the chosen range!)
    const topProductsRes = await pool.query(`
      SELECT p.name, SUM(bi.qty) as total_sold, SUM(bi.subtotal) as total_revenue
      FROM bill_items bi
      JOIN bills b ON bi.bill_id = b.id
      JOIN products p ON bi.product_id = p.id
      WHERE b.user_id = $1 AND ${dateFilterClause.replace('b.created_at', 'b.created_at')}
      GROUP BY p.id, p.name
      ORDER BY total_sold DESC
      LIMIT 5
    `, [userId]);

    res.json({
      success: true,
      data: {
        rangeSales: Number(salesRes.rows[0].range_sales),
        rangeProfit: Number(salesRes.rows[0].range_profit),
        billsCount: Number(salesRes.rows[0].bills_count),
        lowStockItems: Number(stockRes.rows[0].low_stock_items),
        totalMarketUdhari: Number(udhariRes.rows[0].total_market_udhari),
        salesChart,
        topProducts: topProductsRes.rows.map(r => ({ ...r, total_sold: Number(r.total_sold), total_revenue: Number(r.total_revenue) }))
      },
      message: null
    });
  } catch (error) {
    next(error);
  }
};
