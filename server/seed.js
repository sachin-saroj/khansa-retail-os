const { Pool } = require('pg');
require('dotenv').config();
const bcrypt = require('bcryptjs');

if (process.env.NODE_ENV === 'production') {
  console.warn('====================================================');
  console.warn(' FATAL WARNING ');
  console.warn(' Cannot run seed.js in production environments.');
  console.warn(' This script DELETES ALL DATA and recreates records.');
  console.warn('====================================================');
  process.exit(1);
} else {
  console.log(`Current NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`DATABASE_URL configured: ${!!process.env.DATABASE_URL}`);
}

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is missing. Please configure it in your .env file.');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let res = await client.query('SELECT * FROM users LIMIT 1');
    let user_id;
    if (res.rows.length === 0) {
      const hash = await bcrypt.hash('password123', 10);
      res = await client.query(`INSERT INTO users (shop_name, owner_name, phone, password_hash) VALUES ('Sharma Kirana', 'Rahul Sharma', '9999999999', $1) RETURNING id`, [hash]);
    }
    user_id = res.rows[0].id;
    console.log('Using User ID:', user_id);

    await client.query('DELETE FROM customer_transactions;');
    await client.query('DELETE FROM bill_items;');
    await client.query('DELETE FROM bills;');
    await client.query('DELETE FROM products;');
    await client.query('DELETE FROM customers;');
    await client.query('DELETE FROM bill_counters;');

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
      const inst = await client.query(
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
        const inst = await client.query(
            `INSERT INTO customers (user_id, name, phone, created_at) VALUES ($1, $2, $3, NOW() - INTERVAL '30 days') RETURNING id`,
            [user_id, cname, `987654321${i}`]
        );
        cIds.push({ id: inst.rows[0].id, name: cname });
    }
    console.log('Inserted Customers');

    const UDHARI_BALANCES = {};

    let billCounter = 0;
    
    // Simulate last 15 days to speed up and keep trend graphs happy
    for (let d = 15; d >= 1; d--) {
        const date = new Date();
        date.setDate(date.getDate() - d);
        const isSunday = date.getDay() === 0;
        
        let dailyBills = isSunday ? Math.floor(Math.random() * (15 - 10 + 1)) + 10 : Math.floor(Math.random() * (10 - 5 + 1)) + 5;
        
        // slight increasing trend in last 7 days
        if (d <= 7) { dailyBills += 2; }
        
        let dailySeq = 0;

        for (let b = 0; b < dailyBills; b++) {
            billCounter++;
            dailySeq++;
            
            const numItems = Math.floor(Math.random() * 3) + 2; // 2 to 4 products
            let subtotal = 0;
            let profit = 0;
            const items = [];
            
            for(let j=0; j<numItems; j++) {
                const prod = pIds[Math.floor(Math.random() * pIds.length)];
                const qty = Math.floor(Math.random() * 2) + 1;
                const lineTotal = qty * prod.sell;
                const lineProfit = qty * (prod.sell - prod.buy);
                subtotal += lineTotal;
                profit += lineProfit;
                items.push({ pId: prod.id, qty, sell: prod.sell, lineTotal });
            }
            
            const total = subtotal;
            const bNum = `INV-${date.toISOString().split('T')[0].replace(/-/g, '')}-${String(dailySeq).padStart(3, '0')}`;

            // Assign udhari randomly
            const isUdhari = Math.random() > 0.80; 
            let cObj = null;
            if (isUdhari) {
                cObj = cIds[Math.floor(Math.random() * cIds.length)];
                if (!UDHARI_BALANCES[cObj.id]) UDHARI_BALANCES[cObj.id] = 0;
                // keep balances roughly between 150 - 2400
                if (UDHARI_BALANCES[cObj.id] > 2000) cObj = null; 
            }
            
            const billIns = await client.query(
                `INSERT INTO bills (user_id, customer_id, bill_number, subtotal, discount, total, profit, is_udhari, created_at)
                 VALUES ($1, $2, $3, $4, 0, $5, $6, $7, $8) RETURNING id`,
                [user_id, cObj ? cObj.id : null, bNum, subtotal, total, profit, !!cObj, date]
            );
            const bId = billIns.rows[0].id;
            
            for(const item of items) {
                await client.query(
                    `INSERT INTO bill_items (bill_id, product_id, qty, unit_price, subtotal) VALUES ($1, $2, $3, $4, $5)`,
                    [bId, item.pId, item.qty, item.sell, item.lineTotal]
                );
            }
            
            if (cObj) {
                UDHARI_BALANCES[cObj.id] += total;
                await client.query(
                    `INSERT INTO customer_transactions (customer_id, type, amount, note, created_at) VALUES ($1, 'given', $2, $3, $4)`,
                    [cObj.id, total, `Bill ${bNum}`, date]
                );
            }
            
            await client.query(
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
                 await client.query(
                      `INSERT INTO customer_transactions (customer_id, type, amount, note, created_at) VALUES ($1, 'received', $2, 'Cash Payment Full Settlement', NOW() - INTERVAL '2 days')`,
                      [c.id, bal]
                 );
            }
        }
    }
    
    await client.query('COMMIT');
    client.release();
    console.log('Inserted', billCounter, 'bills and adjusted pending udhari properly.');
    process.exit(0);
  } catch (err) {
    await client.query('ROLLBACK');
    client.release();
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
