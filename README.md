<div align="center">
  <img src="./client/public/logo.png" alt="Khansa Logo" width="120" />
  <h1>Khansa: Premium Retail OS</h1>
  <p><strong>Next-Gen POS & Ledger Management System for Precision Retail</strong></p>
</div>

<br />

Welcome to **Khansa** (formerly Kirana OS) — an ultra-premium, full-stack POS and Inventory management software explicitly engineered for local businesses that refuse to compromise on design. We stripped away the clunky ERP bloat, purged generic SaaS elements, and delivered a highly refined "Luxury Editorial" user experience built on React and Node.js.

---

## 🔥 Features

Beyond just basic billing, Khansa is packed with engineering details usually reserved for top-tier enterprise SaaS:

*   🌗 **Automated Dark Mode Engine**: Built-in `ThemeContext` flawlessly shifts the design system—from warm creamy whites to deep slate blacks—without breaking contrast or typography rules.
*   🌍 **Native Multilingual UI**: Localized with a built-in `LanguageContext` supporting instant toggles between English and Hindi, ensuring accessibility for all staff members.
*   📊 **Smart Udhari (Credit) Ledger**: Ditch the physical notebooks. Track customer debts dynamically with auto-calculated net balances and visual indicators.
*   📉 **Predictive Inventory**: Zero-noise, dense tabular inventory with rigorous mathematical boundaries. Items dipping below the "Low Stock Limit" instantly trigger dashboard alerts.
*   🧾 **Precision Rapid-Billing**: Split-pane workstation built for speed. Select Udhari, add items to cart, compute taxes/profit, and generate print-ready PDFs in seconds.
*   📈 **GST-Ready Exports**: Instantly dump your daily/monthly sales into an explicitly formatted CSV designed for easy import into Tally or direct CA handoffs.

---

## 📸 Platform Showcase

### 1. The Command Center (Dashboard)
![Dashboard](./assets/screenshots/dashboard.png)

### 2. POS Workstation (Billing)
![Billing](./assets/screenshots/billing.png)

### 3. Inventory Matrix (Products)
![Products](./assets/screenshots/products.png)

### 4. Credit Ledger (Customers / Udhari)
![Udhari](./assets/screenshots/customers.png)

### 5. Automated Accounting (Reports)
![Reports](./assets/screenshots/reports.png)

### 6. Authentication (Login)
![Login](./assets/screenshots/login.png)

---

## 🚀 Architecture & Tech Stack

Khansa leverages a robust, decoupled architecture capable of scaling securely.

### **Frontend Client**
- **Core:** React 18, Vite, React Router DOM
- **State Management:** Custom Context APIs (`Auth`, `Theme`, `Language`)
- **Styling:** Tailwind CSS mapped to Bespoke Variables (`DM Serif Display`, `DM Mono`)

### **Backend Server**
- **Core Engine:** Node.js, Express.js
- **Database:** PostgreSQL (with heavily optimized `pg` connection pooling window functions)
- **Validation:** Express Validator Middleware

## 🔒 Security Features
- **Authentication:** Dual-layer JWT Auth with short-lived access tokens.
- **Refresh Token Rotation:** HttpOnly cookies utilizing single-use token rotation mapped inside PostgreSQL.
- **Cryptography:** Bcrypt password hashing (`SALT_ROUNDS: 10`).
- **Network Hygiene:** Hardened with basic `Helmet` layers and robust `cors` origin whitelisting mapping to environment URLs natively.
- **Input Sanitization:** Deep-chain express payload validation preventing Stored XSS via HTML Entity escaping sequences.
- **DDoS Mitigation:** Standardized request rate-limiting endpoints out-of-the-box (`express-rate-limit`).

---

## 📦 Installation & Setup

Get Khansa running locally in under 5 minutes:

### 1. Clone the repository
```bash
git clone https://github.com/your-username/khansa-retail-os.git
cd khansa-retail-os
```

### 2. Database Setup (PostgreSQL)
Ensure you have a live, empty PostgreSQL database ready and active on your system.
Create a local database named `khansa_retail_os`. 
```bash
createdb khansa_retail_os
```
*Note: A native schema schema mapping is provided under `server/db/schema.sql`.*

### 3. Setup the Backend Server
```bash
cd server
npm install

# Build environment variables
cp .env.example .env   
# Populate .env with your specific DATABASE_URL and secure JWT Secret hashing rings.

# Migrate Database Schema 
npm run migrate

# (Optional) Seed the database realistically 
# Generates fake product pools and simulates 60 days of transactional user history!
node seed.js

# Start backend server in development watch mode
npm run dev
```

### 4. Setup the Frontend Client
```bash
cd ../client
npm install
npm run dev
```

---

## 🔑 Environment Variables
You must configure the `server/.env` based on `server/.env.example`. 

| Variable | Requirement | Description |
|---|---|---|
| `PORT` | Optional | Maps specific deployment allocation ports (Defaults to 5000). |
| `NODE_ENV` | Required | Triggers production deployment routing rules blocking unsafe seeds. |
| `DATABASE_URL` | Required | Postgres connection string mapping database context. |
| `JWT_SECRET` | Required | Secure cryptographic key for short-lived access tokens logic. |
| `JWT_REFRESH_SECRET` | Required | Secondary cryptographic key validating long-term sessions cookies. |
| `CLIENT_URL` | Required | Enforces targeted backend CORS origin validation configurations. |

---

## 📡 Essential API Routes

*   **Auth:** `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`
*   **Products:** `GET /api/products`, `POST /api/products`, `PUT /api/products/:id`
*   **Customers:** `GET /api/customers`, `POST /api/customers`
*   **Bills:** `POST /api/bills`, `GET /api/bills`
*   **Reports:** `GET /api/reports/dashboard`, `GET /api/reports/sales`

---

## 🚀 Deployment Instructions

### Backend (Render, Railway, Fly.io)
1. Provide `.env` variables mapped exactly inside your platform's dashboard UI.
2. Build command: `npm install`
3. Start command: `npm start`
*Note: We highly suggest utilizing managed PostgreSQL resources attached inside the same VPC framework.*

### Frontend (Vercel, Netlify, Render)
1. Add routing fallback arrays handling client-side SPA routing (`_redirects` or `vercel.json`).
2. Build command: `npm run build`
3. Map build Output Directory to `dist`.

---

## 🛤️ Future Roadmap

- [ ] Mobile App packaging using React Native / Capacitor
- [ ] Supplier ledger maps separating raw vendor material buy pipelines
- [ ] Hardware integrations (Receipt printers natively over websockets vs HTML prints)
- [ ] Multiple store locators with isolated branch roles

---
<div align="center">
  <p>Built with precision for Kirana & Retail. Elevate your local commerce.</p>
</div>

---

## 👨‍💻 Author

Built by **Sachin** 
*SYIT Student, S.K. College of Science & Commerce, Nerul, Navi Mumbai.*  
Stack: Node.js, Express, React, PostgreSQL.
