# PRD — Kirana OS
## Product Requirements Document

**Version:** 1.0  
**Status:** MVP Phase  
**Author:** Sachin  
**Last Updated:** 2025

---

## 1. Product Vision

Build the simplest possible billing + inventory tool for Indian local shops.  
Not a full accounting software. Not an ERP. A focused, fast, mobile-friendly tool that a non-technical shop owner can use without training.

**One-line pitch:** "Vyapar jitna powerful, WhatsApp jitna simple."

---

## 2. User Personas

### Persona 1 — Ramesh Kirana Owner
- Age: 40
- Tech skill: Uses WhatsApp and UPI
- Problem: Forgets udhari, doesn't know daily profit
- Expectation: Big buttons, Hindi labels, fast billing

### Persona 2 — Priya Mobile Shop Owner
- Age: 28
- Tech skill: Moderate, uses Excel sometimes
- Problem: Stock confusion between multiple variants
- Expectation: Quick SKU search, low stock alerts

---

## 3. Functional Requirements

### 3.1 Authentication

| ID | Requirement |
|---|---|
| AUTH-01 | Owner can register with phone number + shop name |
| AUTH-02 | Login via phone + password |
| AUTH-03 | JWT access token (15 min) + refresh token (7 days) |
| AUTH-04 | All routes protected except /login and /register |

---

### 3.2 Product / Inventory Module

| ID | Requirement |
|---|---|
| INV-01 | Owner can add product: name, SKU, category, buy price, sell price, stock qty |
| INV-02 | Owner can edit any product field |
| INV-03 | Owner can delete a product (soft delete — not hard delete) |
| INV-04 | Owner can set low stock threshold per product |
| INV-05 | Products list searchable by name or SKU |
| INV-06 | Products filterable by category |
| INV-07 | On each sale, stock quantity auto-decrements |
| INV-08 | If stock reaches 0, item marked "Out of Stock" and cannot be billed |

---

### 3.3 Billing Module

| ID | Requirement |
|---|---|
| BILL-01 | Owner opens new bill screen |
| BILL-02 | Search and add items to bill by name or SKU |
| BILL-03 | Quantity editable per line item |
| BILL-04 | Subtotal per item auto-calculated (qty × sell price) |
| BILL-05 | Total auto-calculated |
| BILL-06 | Discount field (flat ₹ or %) optional |
| BILL-07 | Bill saved on confirm: deducts stock, logs sale |
| BILL-08 | Each bill has unique bill number (auto-incremented) |
| BILL-09 | Bill receipt downloadable as PDF |
| BILL-10 | Udhari option on bill: assign to customer, amount added to their balance |

---

### 3.4 Dashboard / Reports Module

| ID | Requirement |
|---|---|
| DASH-01 | Today's total sales (₹) |
| DASH-02 | Today's total profit (₹) |
| DASH-03 | Today's bill count |
| DASH-04 | Low stock items listed |
| DASH-05 | Sales graph: last 7 days (bar chart) |
| DASH-06 | Top 5 selling products (by qty and revenue) |
| DASH-07 | Filter: daily / weekly / monthly view |

---

### 3.5 Udhari (Credit Book) Module

| ID | Requirement |
|---|---|
| UDH-01 | Add customer: name, phone number |
| UDH-02 | View customer list with total pending balance |
| UDH-03 | Log a payment received from customer |
| UDH-04 | View full transaction history per customer |
| UDH-05 | Balance auto-updates on payment |
| UDH-06 | Send WhatsApp reminder (deep link, not API) |

---

### 3.6 GST Export Module

| ID | Requirement |
|---|---|
| GST-01 | Monthly invoice list with: date, bill no, total, taxable amount |
| GST-02 | Export as CSV |
| GST-03 | Export as PDF summary |
| GST-04 | Filter by month/year |

---

## 4. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Dashboard loads in < 2 seconds |
| Mobile | Fully responsive, usable on 360px screen |
| Language | English UI + Hindi labels for key actions (e.g. "Bill Banao") |
| Offline | Not required in MVP |
| Security | Passwords hashed with bcrypt, all routes JWT-protected |
| Data Safety | Daily backup recommended; export at any time |

---

## 5. Out of Scope (MVP)

- AI demand prediction
- Voice billing
- Multi-branch dashboard
- WhatsApp API integration (bot)
- Payment gateway (Razorpay)
- Employee/staff management
- Customer-facing app

These are V2 features. Do not build them in MVP.

---

## 6. Success Metrics

| Metric | Target |
|---|---|
| Onboarding time | Shop owner uses billing within 10 min of signup |
| Daily active use | Owner bills at least once per day |
| Churn reason #1 | Too complex → solve with UI simplicity |
| MVP validation | 5 real shops using it for 2 weeks before charging |

---

## 7. Assumptions

1. Owners have Android smartphone or laptop.
2. Shop has basic internet (4G minimum).
3. GST is optional for most early users (not GSTIN-mandatory MVP feature).
4. Single owner per shop in MVP (no employee roles).

---

## 8. Constraints

- Built solo by one developer (Sachin) in 30 days.
- No paid third-party APIs in MVP.
- No mobile app (React web, mobile-responsive only).
