# AGENT_RULES.md — Kirana OS
## Rules for AI Coding Agent

This file defines how the AI agent must behave when generating code for this project.  
Read this file before writing a single line of code.

---

## 1. Project Identity

You are building **Kirana OS** — a billing and inventory SaaS for Indian local shops.  
Tech stack: React + Tailwind (frontend), Node.js + Express (backend), PostgreSQL (database), JWT auth.

**Do not suggest or introduce:**
- MongoDB (we use PostgreSQL)
- GraphQL (we use REST)
- Redux (we use Context API)
- TypeScript (this is JavaScript only, MVP phase)
- Any paid APIs in MVP

---

## 2. Code Quality Rules

### 2.1 Always Write Complete Code
- Never write partial functions with `// TODO` placeholders
- Never leave empty catch blocks
- Every function must do exactly one thing
- Every API route must have error handling

### 2.2 No Hallucinated Packages
- Only use npm packages that actually exist
- Preferred packages: express, pg, bcryptjs, jsonwebtoken, cors, dotenv, axios, react-router-dom, recharts, jspdf, express-rate-limit, express-validator, cookie-parser
- If unsure about a package, use a simpler native approach

### 2.3 Consistent Naming
- Files: kebab-case (`bill-controller.js`, `product-routes.js`)
- Functions: camelCase (`getBills`, `createProduct`)
- DB columns: snake_case (`buy_price`, `stock_qty`, `created_at`)
- React components: PascalCase (`BillingPage`, `ProductCard`)
- Constants: SCREAMING_SNAKE_CASE (`JWT_SECRET`, `MAX_RETRIES`)

---

## 3. Backend Rules

### 3.1 Express Structure
Every controller must follow this pattern:
```javascript
const functionName = async (req, res) => {
  try {
    // logic here
    return res.status(200).json({ success: true, data: result, message: null });
  } catch (error) {
    console.error('functionName error:', error.message);
    return res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
};
```

### 3.2 API Response Envelope
All API responses MUST follow this exact shape:
```javascript
// Success
{ success: true, data: { ... }, message: null }

// Success with pagination
{ success: true, data: [...], total: 150, page: 1, totalPages: 8, message: null }

// Error
{ success: false, data: null, message: "Error description" }
```
Never return data in a different shape. Frontend depends on `res.data.data`.

### 3.3 Auth Middleware
Every protected route must pass through `verifyToken` middleware.  
The middleware attaches `req.user = { id, shop_name }` from JWT payload.  
Always use `req.user.id` to scope DB queries — never expose another owner's data.

### 3.4 Database Rules
- Use parameterized queries only. No string concatenation in SQL. Ever.
  - CORRECT: `db.query('SELECT * FROM products WHERE id = $1', [id])`
  - WRONG: `db.query('SELECT * FROM products WHERE id = ' + id)`
- Always add `WHERE user_id = $1` on every query that fetches owner data
- Soft delete only: set `is_active = FALSE`, never DELETE rows
- All money values stored as `DECIMAL(10,2)`, never float

### 3.5 Validation & Sanitization
- Use `express-validator` for all route validation — never manually parse
- Every route with body/query input must have a validator chain + `validate` middleware
- Required fields: return 400 with field name if missing
- Prices and quantities: must be positive numbers
- Phone numbers: must be numeric string, 10 digits
- Always `.trim()` and `.escape()` string inputs to prevent stored XSS

### 3.6 Profit Calculation
Profit per bill = Sum of ((sell_price - buy_price) × qty) for each line item.  
Calculate server-side. Never trust client-sent profit values.

### 3.7 Bill Number Format
Auto-generated: `BILL-{YYYYMMDD}-{padded sequential number}`  
Example: `BILL-20250419-0042`  
Sequential number resets per shop (not globally).
**CRITICAL:** Use atomic `bill_counters` table with `INSERT ... ON CONFLICT DO UPDATE SET last_seq = last_seq + 1 RETURNING last_seq`. Never use `SELECT MAX()` — it causes race conditions under concurrent requests.

### 3.8 Token Security
- **Access token**: Short-lived (15 min), returned in JSON response body, stored in React state (memory only)
- **Refresh token**: Long-lived (7 days), set as `httpOnly`, `secure`, `sameSite` cookie — never in localStorage
- **Refresh token storage**: Hash stored in `refresh_tokens` table with `revoked` flag
- **Logout**: Set `revoked = TRUE` in `refresh_tokens` table + clear cookie
- **Never store tokens in localStorage** — vulnerable to XSS

### 3.9 Rate Limiting
Apply `express-rate-limit` on auth routes (`/api/auth/*`):
- 10 requests per 15-minute window per IP
- Return `{ success: false, message: 'Too many attempts...' }`

### 3.10 Environment Validation
On server startup, validate all required env vars exist before anything else:
```javascript
const required = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
required.forEach(key => {
  if (!process.env[key]) throw new Error(`Missing env var: ${key}`);
});
```
Fail fast — do not start the server with missing config.

### 3.11 Pagination
All list endpoints must support pagination:
- Query params: `?page=1&limit=20`
- Default: page 1, limit 20
- Response: `{ success: true, data: [...], total: N, page: P, totalPages: T }`
- Use `OFFSET` and `LIMIT` in SQL

### 3.12 Balance Calculation (Udhari)
- Customer pending balance is **always calculated from `customer_transactions`** table
- There is NO `total_pending` column on `customers` table
- Use SQL aggregation: `SUM(CASE WHEN type='credit' THEN amount ELSE 0 END) - SUM(CASE WHEN type='payment' THEN amount ELSE 0 END)`
- Never cache balance in a column — single source of truth is the transactions

### 3.13 PDF Generation
- **Client-side only**: Use `jsPDF` in React components for bill receipts and GST reports
- **Never use jsPDF on server** — it is a browser library, will not work in Node.js
- Server generates **CSV only** (text formatting, no special library needed)
- If server PDF is ever needed, use `pdfkit` (Node.js native) — but not in MVP

---

## 4. Frontend Rules

### 4.1 Axios Instance
Always use the configured Axios instance from `src/api/axios.js`.  
Never write raw `fetch()` calls.  
The instance must attach Authorization header automatically via interceptor.

### 4.2 State Management
- Use React Context for: auth state (user, token in memory, logout)
- Use local `useState` for: form inputs, modal open/close, loading flags
- No global state library needed in MVP
- **Never store auth tokens in localStorage** — use React state (memory) for access token

### 4.3 Error Handling in Components
Every API call must handle errors:
```javascript
try {
  const res = await api.get('/products');
  setProducts(res.data.data);
} catch (err) {
  setError(err.response?.data?.message || 'Something went wrong');
} finally {
  setLoading(false);
}
```
Never let errors fail silently.

### 4.4a XSS Prevention
- **Never** use `dangerouslySetInnerHTML` anywhere in the app
- All user-supplied strings (shop name, product name, customer name) rendered as text nodes only
- Backend sanitization via `express-validator` `.escape()` is first defense; frontend rendering is second

### 4.4 UI Rules (Critical for Target Users)
- Minimum button size: 44px height (touch targets)
- Font size minimum: 16px for body, 20px for primary actions
- All key action buttons must have labels in simple English (Hindi labels optional as subtitle)
- No animations that delay billing flow — speed is priority
- Loading state on every button that triggers API call (disable + spinner)
- Success/error feedback on every form submit (toast or inline message)

### 4.5 Forms
- No HTML `<form>` tag with onSubmit — use button `onClick` with handler
- All inputs controlled (value + onChange)
- Validation runs on button click, not on blur
- Clear form after successful submit

### 4.6 Mobile Responsiveness
Target viewport: 360px minimum width.  
Test all pages at 360px, 390px, 768px.  
Billing page must be fully usable on mobile — this is where most usage will happen.

---

## 5. File Structure Rules

Do not create files outside this structure:
```
client/src/
  pages/        ← one file per page/route
  components/   ← reusable UI only
  hooks/        ← custom hooks (useProducts, useBills, etc.)
  api/          ← axios.js instance only
  context/      ← AuthContext.jsx only
  utils/        ← helper functions (formatCurrency, formatDate)

server/
  routes/       ← route definitions only, no logic
  controllers/  ← all business logic
  models/       ← DB query functions
  middleware/   ← verifyToken, errorHandler
  utils/        ← pdfGenerator, reportHelpers
```

---

## 6. What NOT to Build

Do not add any of the following without explicit instruction:

- AI/ML features (demand prediction, voice billing)
- Multi-shop / multi-branch support
- Employee roles or permissions
- Customer-facing portal
- Razorpay or any payment gateway
- WhatsApp Business API (deep links only)
- Push notifications
- Dark mode toggle
- Multi-language toggle
- Any admin panel

These are V2. Scope creep will delay launch.

---

## 7. When Stuck

If a task is ambiguous, follow this priority:
1. Choose the simpler implementation
2. Choose the faster implementation
3. Leave a clear `// DECISION: [reason]` comment explaining your choice
4. Never assume a feature scope — ask or default to simpler

---

## 8. Definition of Done

A task is complete when:
- [ ] Code runs without errors
- [ ] API route tested with valid + invalid inputs
- [ ] React component renders on mobile (360px)
- [ ] Loading and error states handled
- [ ] No console.log left in production code (use console.error for actual errors only)
- [ ] Variable names are meaningful (no `data2`, `temp`, `x`)

---

## 9. Commit Message Format

```
feat: add billing API with stock auto-decrement
fix: correct profit calculation in bill controller
ui: add low stock badge to product card
refactor: extract bill number generator to utils
docs: update API routes in TASKS.md
```

---

## 10. Environment

Development:
- Backend: http://localhost:5000
- Frontend: http://localhost:5173
- DB: local PostgreSQL instance

All secrets in `.env` file. Never hardcode secrets. Never commit `.env`.
