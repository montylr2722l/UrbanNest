# UrbanNest

> **Discover Your Style, Closer.**

UrbanNest is a local-first multi-vendor fashion marketplace under active development. It is not production-ready.

---

## Table of Contents

- [Project Status](#project-status)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Database](#database)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Deployment](#deployment)
- [Architecture](#architecture)
- [Documentation](#documentation)

---

## Project Status

| Area | Current status |
|---|---|
| Credentials authentication and customer account | Implemented; existing account/profile flows preserved |
| Seller application, admin review, store approval | Implemented |
| Seller product draft, inventory, submit/pause/archive | Implemented (single variant at creation; image upload and editing remain outstanding) |
| Product moderation and public search/catalogue/detail | Implemented (requires live category/product records) |
| Saved address, cart, transactional multi-seller COD checkout | Implemented in code; database integration not run |
| Seller order queue and fulfilment transitions | Implemented with owner checks |
| COD unpaid state and admin reconciliation | Implemented; admin records confirmed collection amount/reference |
| Commission | Admin-configurable global rate, default 10%; order/suborder snapshots recorded |
| Online payments, refunds, payouts, settlements | Not implemented |
| Database migrations | None checked in; target database not inspected or migrated |
| Production readiness | Not ready; see [PROJECT_STATUS.md](./PROJECT_STATUS.md) |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| ORM | Prisma 6 |
| Database | PostgreSQL (Supabase) |
| Auth | Auth.js v5 (NextAuth) |
| Styling | Tailwind CSS |
| UI Primitives | Radix UI |
| Validation | Zod |
| Payments | COD workflow; no online gateway integrated |
| Marketplace Settlement | Not implemented; no payout integration |
| Object Storage | Not configured; product image upload is not implemented |
| Email | Not configured |
| Decimal/Financial | decimal.js |
| Testing | Jest + Playwright |
| Hosting (FE) | Vercel |
| Hosting (BE) | Vercel / Render |

---

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- A PostgreSQL database (local or [Supabase](https://supabase.com))

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_ORG/urbannest.git
cd urbannest
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in the required values. See [Environment Variables](#environment-variables) below.

### 4. Set up the database

```bash
# Generate Prisma client
npm run db:generate

# Validate schema without connecting to a database
npm run db:validate
```

There are currently no checked-in migrations. Review the configured database target and existing schema before creating or applying a migration. Do not run `npm run db:migrate` against a shared or production database; it may apply schema changes.

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

See [`.env.example`](./.env.example) for the complete list with documentation.

**Minimum required for local development:**

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `DIRECT_URL` | Direct DB URL (for migrations, bypasses pooler) |
| `AUTH_SECRET` | Random secret for Auth.js (min 32 chars) |
| `AUTH_URL` | App base URL (e.g. `http://localhost:3000`) |

> ⚠️ **Never commit `.env.local` or any file containing secrets.**

---

## Project Structure

```
urbannest/
├── prisma/
│   ├── schema.prisma       # Complete database schema — single source of truth
│   └── migrations/         # No migration history is checked in yet
│
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (auth)/         # Login, register, reset password
│   │   ├── (customer)/     # Customer storefront
│   │   ├── (seller)/       # Seller dashboard
│   │   ├── (admin)/        # Admin control panel
│   │   ├── api/            # API route handlers
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Homepage
│   │
│   ├── components/         # UI components
│   ├── lib/
│   │   ├── prisma.ts       # Prisma client singleton
│   │   ├── auth.ts         # Auth.js config (Phase 2)
│   │   ├── validations/    # Zod schemas
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Pure utilities
│   │   └── constants/      # Enums and constants
│   │
│   ├── types/              # Shared TypeScript types
│   └── middleware.ts       # Route protection
│
├── docs/                   # Architecture and operational docs
├── .env.example            # Environment variable documentation
└── README.md
```

---

## Database

The full schema is in [`prisma/schema.prisma`](./prisma/schema.prisma).

**Core entities:**

| Entity | Purpose |
|---|---|
| `users` | Customers, sellers, admins |
| `seller_profiles` | Seller KYC, onboarding, business info |
| `stores` | Physical/virtual stores (seller owns many) |
| `store_service_areas` | Pincode/city serviceability |
| `categories` | Hierarchical product categories |
| `products` | Master products (owned by seller, not store) |
| `product_variants` | Size + color variants with SKU and price |
| `product_images` | Product gallery images |
| `inventory` | Stock per store per variant |
| `addresses` | Customer saved addresses |
| `carts` + `cart_items` | Shopping cart |
| `orders` | Parent order (customer checkout) |
| `seller_orders` | Seller-specific fulfillment orders |
| `order_items` | Line items with immutable snapshots |
| `payments` | Payment records with provider references |
| `commission_rules` | Configurable commission system |
| `settlements` | Seller payout records |
| `returns` | Return/exchange requests |
| `refunds` | Refund records |
| `reviews` | Verified purchase reviews |
| `wishlists` + `wishlist_items` | Customer wishlists |
| `coupons` + `coupon_usages` | Promotional codes |
| `notifications` | Multi-channel notification records |
| `audit_logs` | Immutable admin/system event log |

**Key architectural rules:**
- All monetary values use `Decimal` → PostgreSQL `NUMERIC` (never `Float`)
- Product belongs to Seller, not Store
- Inventory belongs to Store + ProductVariant
- Order items store immutable snapshots (price, name, variant, SKU)
- Shipping address stored as snapshot on Order

---

## Development Workflow

```bash
# Development server
npm run dev

# Type check
npm run type-check

# Lint
npm run lint

# Format
npm run format

# Database commands (review target and migration before applying)
npm run db:generate     # Regenerate Prisma client after schema changes
npm run db:validate     # Validate schema with placeholder URLs; no DB connection
# npm run db:migrate    # Creates/applies migration; do not run on unknown/shared DB
npm run db:migrate:deploy  # Applies migrations; run only after owner review
npm run db:studio       # Open Prisma Studio (visual DB browser)

# Tests
npm test                # Unit tests
npm run test:e2e        # End-to-end tests
npm run test:coverage   # Coverage report
```

### Commit Convention

```
feat(scope): description
fix(scope): description
docs(scope): description
test(scope): description
refactor(scope): description
chore(scope): description
```

Examples:
```
feat(auth): add seller authentication with RBAC
feat(products): add product approval workflow
fix(inventory): prevent overselling with reserved quantity
feat(payments): add Razorpay webhook verification
```

---

## Testing

See [`docs/testing.md`](./docs/testing.md) for the full testing strategy.

Tests are mandatory for:
- Authentication and authorization
- Payment webhook handling (idempotency)
- Inventory reservation and concurrency
- Commission calculation
- Order lifecycle state transitions
- Return/refund workflows

---

## Deployment

See [`docs/deployment.md`](./docs/deployment.md) for full deployment instructions.

**Potential deployment architecture (not configured or verified):**
- Frontend: Vercel
- Database: Supabase (managed PostgreSQL)
- Object Storage: Cloudflare R2
- Payments: Razorpay (Test → Live after verification)

> ⚠️ **Never use production credentials in development.**
> ⚠️ **Never use the production database for development.**

---

## Architecture

See [`docs/architecture.md`](./docs/architecture.md) for the full architecture document.

**Request flow:**
```
Browser → Next.js (middleware auth check) → Route Handler → Validation → Authorization → Service → Prisma → PostgreSQL
```

The browser never accesses PostgreSQL directly. All business logic lives in route handlers and service modules, never in React components.

---

## Documentation

| Document | Contents |
|---|---|
| [`docs/architecture.md`](./docs/architecture.md) | System architecture, request flow, decisions |
| [`docs/database.md`](./docs/database.md) | Schema details, indexing, migrations |
| [`docs/environment.md`](./docs/environment.md) | All environment variables explained |
| [`docs/api.md`](./docs/api.md) | API route documentation |
| [`docs/deployment.md`](./docs/deployment.md) | Deployment guide |
| [`docs/testing.md`](./docs/testing.md) | Testing strategy and setup |

---

## Important Notices

> **Razorpay Route** — Marketplace seller payouts require a separate agreement with Razorpay. Do not enable `RAZORPAY_ROUTE_ENABLED=true` until properly onboarded.

> **KYC/Legal** — Seller applications currently collect shop contact/location details only. Seller identity/KYC verification is not implemented. Validate applicable requirements before onboarding real sellers.

> **Tax/GST** — Checkout currently calculates no tax. Validate tax treatment with a qualified Indian tax professional before processing real transactions.

---

*UrbanNest — Build in progress. Not yet in production.*

## Verified implementation status

The current implementation includes customer credentials registration/login/account, seller applications and store profiles, admin seller and product review, seller product/inventory management, public product browse/search/detail, saved addresses, cart, multi-seller COD checkout and order fulfilment. COD collection can be recorded by an admin after delivery. The Prisma schema defines additional marketplace entities not yet used by working flows. No online payment provider, payout system, returns workflow, image upload service, checked-in migration or seed script is provided. See [PROJECT_STATUS.md](./PROJECT_STATUS.md) for current limitations and verification.

Do not use a publicly reachable seeded administrator password. No admin bootstrap workflow currently exists; provision an administrator through a controlled, reviewed database procedure once that workflow is designed.
