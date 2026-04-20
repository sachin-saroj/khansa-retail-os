const pool = require('../db');

exports.exportBills = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = '';
    const params = [req.user.id];
    
    // We join bills, bill_items, and products to get all details required
    if (startDate && endDate) {
      dateFilter = 'AND DATE(b.created_at) >= $2 AND DATE(b.created_at) <= $3';
      params.push(startDate, endDate);
    }

    const { rows } = await pool.query(`
      SELECT 
        b.created_at as date,
        b.bill_number as bill_no,
        p.name as product,
        bi.qty as qty,
        bi.unit_price as unit_price,
        bi.subtotal as total_price,
        (bi.qty * (bi.unit_price - p.buy_price)) as profit
      FROM bills b
      JOIN bill_items bi ON b.id = bi.bill_id
      JOIN products p ON bi.product_id = p.id
      WHERE b.user_id = $1 ${dateFilter}
      ORDER BY b.created_at DESC, b.bill_number DESC
    `, params);

    // Generate CSV format
    const csvRows = [
      ['Date', 'Bill No', 'Product', 'Qty', 'Unit Price', 'Total', 'Profit']
    ];

    rows.forEach(r => {
      // Clean cell values safely for CSV (e.g. enclose strings with commas in quotes)
      const cleanStr = (str) => `"${String(str).replace(/"/g, '""')}"`;
      
      const dt = new Date(r.date);
      const formattedDate = dt.toISOString().split('T')[0];

      csvRows.push([
        formattedDate,
        r.bill_no,
        cleanStr(r.product),
        r.qty,
        Number(r.unit_price).toFixed(2),
        Number(r.total_price).toFixed(2),
        Number(r.profit).toFixed(2)
      ]);
    });

    const csvContent = csvRows.map(e => e.join(",")).join("\n");
    
    const fileDateSuffix = (startDate && endDate) ? `${startDate}_${endDate}` : 'all_time';

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=kirana_report_${fileDateSuffix}.csv`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
