<div align="center">
  <img src="./client/public/logo.png" alt="Khansa Logo" width="120" />
  <h1>Khansa: Premium Retail OS</h1>
  <p><strong>Next-Gen POS & Ledger Management System for Precision Retail</strong></p>
</div>

<br />

Welcome to **Khansa** (formerly Kirana OS) — an ultra-premium, full-stack POS and Inventory management SaaS explicitly engineered for local businesses that refuse to compromise on design. We stripped away the clunky ERP bloat, purged generic SaaS elements, and delivered a highly refined "Luxury Editorial" user experience built on React and Node.js.

---

## 📸 Platform Showcase

*(Use your local system to take high-res screenshots of your localhost:5173 pages and save them to `assets/screenshots/` to display them here!)*

### 1. The Command Center (Dashboard)
![Dashboard](./assets/screenshots/dashboard.png)
> **Top-tier analytics at a glance.** Live calculated Market Udhari, 7-day Sales Trends, and Low Stock Alerts enclosed in a strict, high-contrast, asymmetric framework.

### 2. POS Workstation (Billing)
![Billing](./assets/screenshots/billing.png)
> **Built for speed.** Split-pane architecture. Live Cart Ledger firmly on the left; instant checkout and Udhari selection cleanly isolated on the right. 

### 3. Inventory Matrix (Products)
![Products](./assets/screenshots/products.png)
> **Dense data, zero noise.** Full-bleed tabular design. Mono-spaced numerics for frictionless price scanning and rigorous stock threshold management.

### 4. Credit Ledger (Customers / Udhari)
![Udhari](./assets/screenshots/customers.png)
> **Total financial clarity.** Dedicated credit profiles replacing messy notebooks. Instant visibility into due balances (`Danger`) vs overpaid/cleared accounts (`Success`).

### 5. Automated Accounting (Reports)
![Reports](./assets/screenshots/reports.png)
> **Hassle-free exports.** Instantly drop your exact daily or monthly sales bounds to generate precise CSV sheets ready for GST filings.

### 6. Authentication (Login)
![Login](./assets/screenshots/login.png)
> **Minimalist entry.** A distraction-free Auth gateway respecting the "Khansa" luxury brand identity.

---

## 🛠️ Core Features

- **Precision Billing** — Auto-calculating invoices, easy PDF rendering, and instant credit tracking.
- **Dynamic Inventory** — Comprehensive buy/sell tracking with automated "Low Stock" indicators.
- **Smart Udhari System** — A structural column-grid style ledger to display customer profiles and exact balance histories.
- **Bespoke UI Design** — Powered by `DM Serif Display` and `DM Mono` for an uncompromising, professional visual identity.

## 🚀 Tech Stack

- **Frontend:** React + Vite + Tailwind CSS (Custom "Khansa" Design System Variables)
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL (with `pg` pooling)
- **Security:** JWT (Access & Refresh token strategies) and Bcrypt hashing

---

## 💻 Local Setup & Installation

Get Khansa running locally in under 3 minutes:

```bash
# 1. Clone the repository
git clone https://github.com/your-username/khansa-os.git
cd khansa-os

# 2. Setup the Backend (Express + Postgres)
cd server
npm install
# Copy the env file and fill in your PostgreSQL URL
cp .env.example .env   
# Seed the database realistically (Populates 2+ months of sales and Udhari!)
node seed.js
# Start backend server
npm run dev

# 3. Setup the Frontend (Vite + React)
cd ../client
npm install
npm run dev
```

### ⚙️ Environment Variables Required (`server/.env`)
\`\`\`env
DATABASE_URL=postgresql://postgres:password@localhost:5432/kiranaos
JWT_SECRET=supersecretjwtkey_for_kiranaos
JWT_REFRESH_SECRET=another_super_secret_refresh_key
PORT=5000
\`\`\`

---

## 👨‍💻 Author

Built by **Sachin** 
*SYIT Student, S.K. College of Science & Commerce, Nerul, Navi Mumbai.*  
Stack: Node.js, Express, React, PostgreSQL.
