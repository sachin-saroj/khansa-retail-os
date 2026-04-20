const { Pool } = require('pg');
require('dotenv').config();
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres123@localhost:5432/kiranaos' });

async function seed() {
  try {
    let res = await pool.query('SELECT * FROM users LIMIT 1');
    let user_id;
    if (res.rows.length === 0) {
      const hash = await bcrypt.hash('password123', 10);
      res = await pool.query(`INSERT INTO users (shop_name, owner_name, phone, password_hash) VALUES ('Sharma Kirana', 'Rahul Sharma', '9999999999', $1) RETURNING id`, [hash]);
    }
    user_id = res.rows[0].id;
    console.log('Using User ID:', user_id);

    await pool.query('DELETE FROM customer_transactions;');
    await pool.query('DELETE FROM bill_items;');
    await pool.query('DELETE FROM bills;');
    await pool.query('DELETE FROM products;');
    await pool.query('DELETE FROM customers;');
    await pool.query('DELETE FROM bill_counters;');

    // 15-20 specific products with 5-15% margin and appropriate categories
    const rawProducts = [
      { name: 'Tata Salt 1kg', cat: 'GROCERY', buy: 20, sell: 24, stock: 45 },
      { name: 'Aashirvaad Atta 5kg', cat: 'GROCERY', buy: 195, sell: 215, stock: 20 },
      { name: 'Fortune Sunflower Oil 1L', cat: 'GROCERY', buy: 135, sell: 150, stock: 3 }, // low stock
      { name: 'Amul Butter 500g', cat: 'DAIRY', buy: 235, sell: 255, stock: 15 },
      { name: 'Parle-G Biscuits', cat: 'SNACKS', buy: 4, sell: 5, stock: 100 },
      { name: 'Maggi Noodles 70g', cat: 'SNACKS', buy: 12, sell: 14, stock: 2 }, // low stock
      { name: 'Surf Excel 1kg', cat: 'GROCERY', buy: 185, sell: 205, stock: 12 },
      { name: 'Colgate 200g', cat: 'PERSONAL CARE', buy: 95, sell: 105, stock: 22 },
      { name: 'Lays Classic 26g', cat: 'SNACKS', buy: 8, sell: 10, stock: 30 },
      { name: 'Dairy Milk 40g', cat: 'SNACKS', buy: 35, sell: 40, stock: 40 },
      { name: 'Ariel 500g', cat: 'GROCERY', buy: 110, sell: 125, stock: 25 },
      { name: 'Horlicks 500g', cat: 'BEVERAGES', buy: 225, sell: 245, stock: 3 }, // low stock
      { name: 'Clinic Plus Shampoo 340ml', cat: 'PERSONAL CARE', buy: 145, sell: 160, stock: 18 },
      { name: 'Dettol Soap 75g', cat: 'PERSONAL CARE', buy: 32, sell: 35, stock: 35 },
      { name: 'Good Day Biscuits', cat: 'SNACKS', buy: 18, sell: 20, stock: 40 },
      { name: 'Bourbon Biscuits', cat: 'SNACKS', buy: 27, sell: 30, stock: 30 },
      { name: 'Vim Dishwash Bar 200g', cat: 'GROCERY', buy: 15, sell: 18, stock: 8 },
      { name: 'Red Label Tea 250g', cat: 'BEVERAGES', buy: 115, sell: 130, stock: 14 }
    ];

    const pIds = [];
    for (let i=0; i<rawProducts.length; i++) {
      const p = rawProducts[i];
      const sku = `PROD-${i+1}`;
      const inst = await pool.query(
        `INSERT INTO products (user_id, name, sku, category, buy_price, sell_price, stock_qty, low_stock_threshold) VALUES ($1, $2, $3, $4, $5, $6, $7, 5) RETURNING id`,
        [user_id, p.name, sku, p.cat, p.buy, p.sell, p.stock]
      );
      pIds.push({ ...p, id: inst.rows[0].id });
    }
    console.log('Inserted Products');

    // Udhari Customers
    const customerNames = [
      'Ramesh Sharma', 'Priya Nair', 'Suresh Patil', 
      'Anita Mehta', 'Vijay Kumar', 'Lakshmi Devi', 'Ravi Joshi'
    ];
    const cIds = [];
    const clearedCustomerNames = ['Vijay Kumar', 'Ravi Joshi']; // These will have 0 balance
    
    for (let i=0; i<customerNames.length; i++) {
        const cname = customerNames[i];
        const inst = await pool.query(
            `INSERT INTO customers (user_id, name, phone, created_at) VALUES ($1, $2, $3, NOW() - INTERVAL '30 days') RETURNING id`,
            [user_id, cname, `987654321${i}`]
        );
        cIds.push({ id: inst.rows[0].id, name: cname });
    }
    console.log('Inserted Customers');

    const UDHARI_BALANCES = {};

    let billCounter = 0;
    
    // Simulate last 60 days
    for (let d = 60; d >= 1; d--) {
        const date = new Date();
        date.setDate(date.getDate() - d);
        const isSunday = date.getDay() === 0;
        
        let dailyBills = isSunday ? Math.floor(Math.random() * (25 - 15 + 1)) + 15 : Math.floor(Math.random() * (15 - 8 + 1)) + 8;
        
        // slight increasing trend in last 7 days
        if (d <= 7) { dailyBills += 3; }
        
        let dailySeq = 0;

        for (let b = 0; b < dailyBills; b++) {
            billCounter++;
            dailySeq++;
            
            const numItems = Math.floor(Math.random() * 4) + 2; // 2 to 5 products
            let subtotal = 0;
            let profit = 0;
            const items = [];
            
            for(let j=0; j<numItems; j++) {
                const prod = pIds[Math.floor(Math.random() * pIds.length)];
                const qty = Math.floor(Math.random() * 3) + 1;
                const lineTotal = qty * prod.sell;
                const lineProfit = qty * (prod.sell - prod.buy);
                subtotal += lineTotal;
                profit += lineProfit;
                items.push({ pId: prod.id, qty, sell: prod.sell, lineTotal });
            }
            
            const total = subtotal;
            const bNum = `INV-${date.toISOString().split('T')[0].replace(/-/g, '')}-${String(dailySeq).padStart(3, '0')}`;

            // Assign udhari randomly
            const isUdhari = Math.random() > 0.85; 
            let cObj = null;
            if (isUdhari) {
                cObj = cIds[Math.floor(Math.random() * cIds.length)];
                if (!UDHARI_BALANCES[cObj.id]) UDHARI_BALANCES[cObj.id] = 0;
                // keep balances roughly between 150 - 2400
                if (UDHARI_BALANCES[cObj.id] > 2000) cObj = null; 
            }
            
            const billIns = await pool.query(
                `INSERT INTO bills (user_id, customer_id, bill_number, subtotal, discount, total, profit, is_udhari, created_at)
                 VALUES ($1, $2, $3, $4, 0, $5, $6, $7, $8) RETURNING id`,
                [user_id, cObj ? cObj.id : null, bNum, subtotal, total, profit, !!cObj, date]
            );
            const bId = billIns.rows[0].id;
            
            for(const item of items) {
                await pool.query(
                    `INSERT INTO bill_items (bill_id, product_id, qty, unit_price, subtotal) VALUES ($1, $2, $3, $4, $5)`,
                    [bId, item.pId, item.qty, item.sell, item.lineTotal]
                );
            }
            
            if (cObj) {
                UDHARI_BALANCES[cObj.id] += total;
                await pool.query(
                    `INSERT INTO customer_transactions (customer_id, type, amount, note, created_at) VALUES ($1, 'credit', $2, $3, $4)`,
                    [cObj.id, total, `Bill ${bNum}`, date]
                );
            }
            
            await pool.query(
               `INSERT INTO bill_counters (user_id, date, last_seq) VALUES ($1, $2, $3)
                ON CONFLICT (user_id, date) DO UPDATE SET last_seq = $3`,
               [user_id, date.toISOString().split('T')[0], dailySeq]
            );
        }
    }

    // Now process "CLEARED" customers
    for (const c of cIds) {
        if (clearedCustomerNames.includes(c.name)) {
            const bal = UDHARI_BALANCES[c.id] || 0;
            if (bal > 0) {
                 await pool.query(
                      `INSERT INTO customer_transactions (customer_id, type, amount, note, created_at) VALUES ($1, 'payment', $2, 'Cash Payment Full Settlement', NOW() - INTERVAL '2 days')`,
                      [c.id, bal]
                 );
            }
        }
    }
    
    console.log('Inserted', billCounter, 'bills and adjusted pending udhari properly.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
