<div align="center">
  <img src="./client/public/logo.png" alt="Khansa Logo" width="120" />
  <h1>Khansa: Premium Retail OS</h1>
  <p><strong>Next-Gen POS & Ledger Management System for Precision Retail</strong></p>
</div>

<br />

Welcome to **Khansa** (formerly Kirana OS) — an ultra-premium, full-stack POS and Inventory management SaaS explicitly engineered for local businesses that refuse to compromise on design. We stripped away the clunky ERP bloat, purged generic SaaS elements, and delivered a highly refined "Luxury Editorial" user experience built on React and Node.js.

---

## 🔥 Enterprise-Grade Features

Beyond just basic billing, Khansa is packed with engineering details usually reserved for top-tier enterprise SaaS:

*   🌗 **Automated Dark Mode Engine**: Built-in `ThemeContext` that flawlessly shifts the entire "Khansa" design system—from warm creamy whites to deep slate blacks—without breaking contrast or typography rules.
*   🌍 **Native Multilingual UI**: Localized for Indian shops with built-in `LanguageContext` supporting instant toggles between English and Hindi, ensuring accessibility for all staff members.
*   📊 **Smart Udhari (Credit) Ledger**: Ditch the physical notebooks. Track customer debts dynamically with auto-calculated net balances and visual Danger/Success indicators.
*   📉 **Predictive Inventory**: Zero-noise, dense tabular inventory with rigorous mathematical boundaries. Items dipping below the "Low Stock Limit" instantly trigger dashboard alerts.
*   🧾 **Precision Rapid-Billing**: Split-pane workstation built for speed. Select Udhari, add items to cart, compute taxes/profit, and generate print-ready PDFs in seconds.
*   📈 **GST-Ready CSV Exports**: Instantly dump your daily/monthly sales into an explicitly formatted CSV designed for easy import into Tally or direct CA handoffs.

---

## 📸 Platform Showcase

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

## 🚀 Architecture & Tech Stack

Khansa leverages a robust, decoupled architecture capable of scaling across multiple shop instances.

- **Frontend Core:** React, Vite, React Router DOM
- **State Management:** Custom Context APIs (`Auth`, `Theme`, `Language`)
- **Styling:** Tailwind CSS mapped to Bespoke "Khansa" Variables (`DM Serif Display`, `DM Mono`)
- **Backend API:** Node.js, Express.js
- **Database:** PostgreSQL (with heavily optimized `pg` connection pooling)
- **Security:** Hardened JWT Auth (Access & Refresh tokens), Bcrypt password hashing
- **Data Seed:** Integrated 60-day random-walk mathematical generation script for flawless demo deployments.

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
