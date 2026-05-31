# Khansa Retail OS Architecture

## System Overview
Khansa Retail OS uses a decoupled Client-Server architecture. The frontend is a React Single Page Application (SPA), while the backend is an Express Node.js REST API interacting with a PostgreSQL database via native pooling mechanisms. 

## Frontend Architecture
- **Framework:** React 18, utilizing Vite for high-performance builds.
- **Routing:** React Router v6 mapping isolated Protected vs Public domains.
- **State Management:** Core application state is decoupled into independent React Contexts (`AuthContext`, `ThemeContext`, `LanguageContext`), avoiding Redux bloat for this specific scope.
- **Styling:** Tailwind CSS mapped to bespoke typography (`DM Serif Display`, `DM Mono`).
- **Data Fetching:** Axios instance configured to automatically attach JWT authorization headers and handle silent token refreshes via interceptors.

## Backend Architecture
- **Framework:** Express.js 4 on Node.js.
- **Layered Structure:**
  - **Routes:** API endpoint definitions delegating mapping to distinct logic units.
  - **Controllers:** Request/Response scope isolation and HTTP status mappings.
  - **Models:** Direct PostgreSQL queries utilizing `pg` connection pools ensuring minimal footprint and scaling capabilities.
  - **Middleware:** Auth verification, schema validation mapping, and DDoS rate-limiting boundaries.

## Authentication Flow
Dual-token architecture ensuring localized memory restrictions:
1. Client logs in with credentials via `login` route.
2. Server validates bcrypt hash and responds with a short-lived Access Token in JSON payload and a long-lived Refresh Token stored inside an `HttpOnly` secure cookie.
3. Access token is strictly tracked in memory (`AuthContext`) and attached as `Bearer` token on subsequent REST calls.

## Refresh Token Rotation Flow
To maximize network security over extended sessions:
1. Upon Access Token expiration, the client triggers a silent POST to `/api/auth/refresh`.
2. The server acquires the Refresh Token bound inside the `HttpOnly` cookie.
3. If syntactically valid, the server executes a DB lookup (`refresh_tokens` table) to verify it hasn't been explicitly revoked globally.
4. The server creates a net-new Access and Refresh Token set.
5. The prior Refresh Token is marked as `revoked = true` representing stateful usage.
6. The new tokens are transmitted; the Access Token to local memory, the Refresh Token overriding the existing secure cookie state.

## Database Schema Overview
- **Users:** Store internal POS account credentials (bcrypt hashed).
- **Products:** Inventory master table managing thresholds and mathematical item tracking limits.
- **Customers:** Credit Ledgers tracking global "Udhari" data.
- **Bills:** Immutable transaction receipts linking product clusters to customer hashes globally.
- **Bill_Items:** Granular foreign-key mappings attaching line-item cost realities mathematically.
- **Refresh_Tokens:** Stateful session tokens securing auth lifecycles inherently.

## API Request Lifecycle
1. Request hits network -> Encounters `helmet` and dynamic `cors` whitelists.
2. `express-rate-limit` validates origin constraints preventing volumetric attacks.
3. Protected payload routes go through `express-validator` to ensure all bounds escape HTML characters preventing Stored XSS operations.
4. Secure endpoint requests flow through Auth middleware checking validity of `Bearer` token sequences.
5. Assigned Controller executes specific logic boundaries against Model queries.
6. Request closes safely returning defined formatted structures.

## Deployment Architecture
- **API Engine (Render, Fly.io):** Deployed as stateless Node environments securely tied to DB networking blocks.
- **Database (Neon, Supabase, RDS):** PostgreSQL utilizing intrinsic connection pooling arrays to balance parallel operations securely.
- **Static Frontend (Vercel, Netlify):** Globally cached CDN distribution.

## Future Scaling Plan
1. **Vertical Compute Expansion:** Scaling underlying Postgres hardware memory allocations for high-intensity windowing aggregations.
2. **Horizontal Engine Distribution:** Routing multiple API instances behind a native load balancer; integrating stateless Redis instances replacing native PostgreSQL refresh revocation checks to rapidly handle auth queries.
3. **Multi-Tenancy Mapping:** Altering schemas to attach arbitrary `tenant_id` domains enabling true singular-deployment generic SaaS distribution frameworks mapping unique customers simultaneously off a sole structural build.