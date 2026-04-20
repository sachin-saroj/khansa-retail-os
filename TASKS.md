# TASKS.md — Kirana OS Build Plan
## 30-Day MVP Sprint

**Convention:**
- `[ ]` = not started
- `[x]` = complete
- `[~]` = in progress

---

## WEEK 1 — Foundation (Days 1–7)

### Backend Setup
- [ ] Initialize Node.js + Express project
- [ ] Setup folder structure: routes/, controllers/, models/, middleware/, middleware/validators/, utils/
- [ ] Connect PostgreSQL database
- [ ] Write DB schema and run migrations (users, products, sales, sale_items, customers, transactions, bill_counters, refresh_tokens)
- [ ] Setup dotenv, cors, helmet, morgan, cookie-parser, express-rate-limit, express-validator
- [ ] Add env validation on startup (fail if DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET missing)

### Auth
- [ ] POST /api/auth/register — validate with express-validator, hash password with bcrypt, return access token in body + refresh token as httpOnly cookie
- [ ] POST /api/auth/login — verify password, same token flow
- [ ] POST /api/auth/refresh — read httpOnly cookie, check refresh_tokens table, issue new access token
- [ ] POST /api/auth/logout — revoke refresh token in DB, clear cookie
- [ ] Auth middleware — verify JWT on protected routes
- [ ] Rate limiting middleware on /api/auth/* (10 req / 15 min)
- [ ] Test all auth routes with Postman

### Products API
- [ ] POST /api/products — add product
- [ ] GET /api/products — list all (with search, category filter)
- [ ] GET /api/products/:id — single product
- [ ] PUT /api/products/:id — update
- [ ] DELETE /api/products/:id — soft delete (is_active = false)

### Frontend Setup
- [ ] Initialize React + Vite project
- [ ] Install Tailwind CSS
- [ ] Setup React Router
- [ ] Setup Axios instance with base URL + auth token interceptor (withCredentials: true)
- [ ] Create AuthContext (login state, token in memory only — no localStorage)
- [ ] Silent refresh on app mount via /api/auth/refresh
- [ ] Build Login page
- [ ] Build Register page
- [ ] Protected route wrapper component

---

## WEEK 2 — Core Business Logic (Days 8–14)

### Inventory UI
- [ ] Products list page with search bar
- [ ] Add Product form (name, SKU, category, buy price, sell price, qty, low stock threshold)
- [ ] Edit Product modal
- [ ] Delete confirmation modal
- [ ] Low stock badge on product card (red if qty <= threshold)

### Billing API
- [ ] POST /api/bills — create bill, auto-decrement stock, calculate profit, use atomic bill_counters table
- [ ] GET /api/bills — list all bills (paginated: ?page=1&limit=20)
- [ ] GET /api/bills/:id — single bill with line items

### Billing UI
- [ ] New Bill page
- [ ] Item search + add to bill (live search by name/SKU)
- [ ] Line item list (item name, qty input, unit price, subtotal)
- [ ] Bill total, discount input, final total
- [ ] Confirm Bill button → POST to API
- [ ] Success screen with bill number
- [ ] Bill receipt PDF download (client-side with pdf-lib or jsPDF)

### Stock Auto-Decrement
- [ ] On bill confirm, backend reduces qty for each item
- [ ] If qty < 0 attempted, return 400 error with item name
- [ ] Frontend handles this error with alert

---

## WEEK 3 — Dashboard + Alerts (Days 15–21)

### Reports API
- [ ] GET /api/reports/daily?date=YYYY-MM-DD — total sales, profit, bill count
- [ ] GET /api/reports/weekly — last 7 days breakdown
- [ ] GET /api/reports/top-products?period=7d — top 5 by qty
- [ ] GET /api/reports/low-stock — products below threshold

### Dashboard UI
- [ ] Today's summary cards: Sales ₹, Profit ₹, Bills Count
- [ ] Bar chart: last 7 days sales (use Recharts)
- [ ] Top 5 products table
- [ ] Low stock alerts panel (list with "Restock" button)
- [ ] Date filter: Today / This Week / This Month

### Notifications
- [ ] On dashboard load, fetch low stock items
- [ ] Badge on nav showing low stock count
- [ ] Toast notification on login if any item is critically low (< 3 qty)

---

## WEEK 4 — Udhari + GST + Deploy (Days 22–30)

### Udhari API
- [ ] POST /api/customers — add customer
- [ ] GET /api/customers — list with pending balance
- [ ] GET /api/customers/:id — profile + transaction history
- [ ] POST /api/customers/:id/payments — log payment received
- [ ] Balance auto-calculated from transactions table (no total_pending column)

### Udhari UI
- [ ] Customer list page with pending balance badges
- [ ] Customer detail page: transaction history, "Record Payment" button
- [ ] Add Customer modal
- [ ] WhatsApp deep link button: `https://wa.me/91XXXXXXXXXX?text=...`

### GST Export
- [ ] GET /api/reports/gst?month=MM&year=YYYY — invoice list (JSON)
- [ ] GET /api/reports/gst/csv — download CSV (server-side generation)
- [ ] Frontend: GST Reports page with month/year picker + Download PDF (client-side jsPDF) + Download CSV buttons
- [ ] Client-side GST PDF generator using jsPDF + jspdf-autotable

### Final Polish
- `[x]` Error boundary in React for unhandled errors
- `[x]` Loading skeletons on all data-fetch pages
- `[x]` Empty state UI (no products, no bills, no customers)
- `[x]` 404 page
- `[x]` Responsive check on mobile (360px, 390px, 414px)
- [ ] Form validation on all inputs (no empty submit allowed)

### Deployment
- [ ] Push code to GitHub
- [ ] Deploy backend to Railway (set env vars)
- [ ] Deploy frontend to Vercel (set VITE_API_URL)
- [ ] Test full flow on live URL
- [ ] Add live URL to GitHub README

---

## Database Schema (Reference)

```sql
-- Users (shop owners)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  shop_name VARCHAR(100) NOT NULL,
  owner_name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  sku VARCHAR(50),
  category VARCHAR(50),
  buy_price DECIMAL(10,2) NOT NULL,
  sell_price DECIMAL(10,2) NOT NULL,
  stock_qty INT NOT NULL DEFAULT 0,
  low_stock_threshold INT DEFAULT 5,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bills
CREATE TABLE bills (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  customer_id INT REFERENCES customers(id) NULL,
  bill_number VARCHAR(20) UNIQUE NOT NULL,
  subtotal DECIMAL(10,2),
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2),
  profit DECIMAL(10,2),
  is_udhari BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bill Line Items
CREATE TABLE bill_items (
  id SERIAL PRIMARY KEY,
  bill_id INT REFERENCES bills(id),
  product_id INT REFERENCES products(id),
  qty INT NOT NULL,
  unit_price DECIMAL(10,2),
  subtotal DECIMAL(10,2)
);

-- Customers (Udhari)
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(15),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Customer Transactions
CREATE TABLE customer_transactions (
  id SERIAL PRIMARY KEY,
  customer_id INT REFERENCES customers(id),
  type VARCHAR(10) CHECK (type IN ('credit', 'payment')),
  amount DECIMAL(10,2),
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bill Number Counter (atomic sequence per shop per day)
CREATE TABLE bill_counters (
  user_id INT REFERENCES users(id),
  date DATE NOT NULL,
  last_seq INT DEFAULT 0,
  PRIMARY KEY (user_id, date)
);

-- Refresh Tokens (for logout/invalidation)
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Route Summary

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh

GET    /api/products
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id

POST   /api/bills
GET    /api/bills
GET    /api/bills/:id

GET    /api/customers
POST   /api/customers
GET    /api/customers/:id
POST   /api/customers/:id/payments

GET    /api/reports/daily
GET    /api/reports/weekly
GET    /api/reports/top-products
GET    /api/reports/low-stock
GET    /api/reports/gst
GET    /api/reports/gst/csv
```
