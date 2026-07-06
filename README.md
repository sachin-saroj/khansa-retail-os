<div align="center">
  <img src="./client/public/logo.png" alt="Khansa Logo" width="120" />
  <h1>Khansa Retail OS</h1>
  <p><strong>POS & Ledger Management System for Retail</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version" />
    <img src="https://img.shields.io/badge/node-%3E%3D%2018.0.0-brightgreen.svg" alt="Node Version" />
    <img src="https://img.shields.io/badge/react-18.x-61dafb.svg" alt="React" />
    <img src="https://img.shields.io/badge/postgres-15.x-336791.svg" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" />
  </p>
</div>

<br />

Welcome to **Khansa** (formerly Kirana OS) — a full-stack Point of Sale (POS) and Inventory management software engineered for local businesses. Khansa is designed to be lightweight and efficient, providing essential retail management tools using React and Node.js.

---

## ⚙️ Core Features

Khansa provides the core features required for daily retail operations:

*   🌗 **Dark Mode Support**: Built-in `ThemeContext` that shifts the user interface between light and dark themes while maintaining accessibility and contrast.
*   🌍 **Multilingual UI**: Localized with a built-in `LanguageContext` supporting toggles between English and Hindi for staff accessibility.
*   📊 **Customer Credit Ledger**: Track customer debts dynamically with auto-calculated net balances and visual status indicators.
*   🔍 **Smart Autocomplete**: Context-aware customer search directly integrated into the billing POS for rapid Udhari checkout.
*   📉 **Inventory Alerts**: Tabular inventory tracking with defined limits. Items dipping below the "Low Stock Limit" trigger dashboard alerts.
*   🧾 **Split-Pane Billing**: Interface designed for checkout speed. Select customers, add items to cart, compute taxes/profit, and generate PDFs.
*   📈 **CSV Exports**: Export daily/monthly sales into an explicitly formatted CSV designed for standard accounting import.

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
git clone https://github.com/sachin-saroj/khansa-retail-os.git
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

## 🧪 Automated Testing

Khansa OS includes a robust end-to-end (E2E) testing suite utilizing Puppeteer to ensure critical business logic remains intact.

```bash
# Run the complete E2E validation suite
node test-e2e.js
```
The testing suite validates:
- Core Authentication (Registration, Login, Refresh Token Rotation)
- Route Protection & Rate Limiting
- Customer Module (Creation, Ledger Updates)
- Billing POS workflows (Cash & Udhari integrations)

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
*BSC-IT Student, S.K. College of Science & Commerce, Nerul, Navi Mumbai.*  
Stack: Node.js, Express, React, PostgreSQL.


## Changelog
- **[#45]** Document Docker container layout setup (7)
- **[#43]** Optimize index search fields in schema (6)
- **[#41]** Add test assertions for categorizations logic (5)
- **[#39]** Improve timeout handling for api queries (4)
- **[#37]** Add performance telemetry logs (3)
- **[#35]** Refactor error alerts to use inline visual banners (2)
- **[#33]** Fix console warning in chart rendering (1)
- **[#31]** Add automated checks for base tax rates helper
- **[#29]** Correct typographical errors in architectural documentation
- **[#27]** Implement GSTIN verification checks in Shop setup routes
- **[#25]** Validate available stock count before inventory deduction
- **[#23]** Fix floating-point rounding precision issues in POS totals