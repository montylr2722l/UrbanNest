# UrbanNest

> **Discover Your Style, Closer.**

UrbanNest is a production-grade multi-vendor fashion marketplace connecting customers with local physical fashion stores, online sellers, and brands across India.

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

| Phase | Description | Status |
|---|---|---|
| Phase 0 | Project foundation | ✅ Complete |
| Phase 1 | Database + Prisma migrations | 🔄 Next |
| Phase 2 | Authentication + RBAC | ⏳ Pending |
| Phase 3 | Seller onboarding + KYC | ⏳ Pending |
| Phase 4 | Stores + location | ⏳ Pending |
| Phase 5 | Categories + products | ⏳ Pending |
| Phase 6 | Variants + inventory | ⏳ Pending |
| Phase 7 | Customer storefront | ⏳ Pending |
| Phase 8 | Cart + checkout | ⏳ Pending |
| Phase 9 | Orders + seller orders | ⏳ Pending |
| Phase 10 | Payments + COD | ⏳ Pending |
| Phase 11 | Commission + settlements | ⏳ Pending |
| Phase 12 | Delivery workflow | ⏳ Pending |
| Phase 13 | Returns + exchanges + refunds | ⏳ Pending |
| Phase 14 | Reviews + wishlist + coupons | ⏳ Pending |
| Phase 15 | Seller dashboard | ⏳ Pending |
| Phase 16 | Admin dashboard | ⏳ Pending |
| Phase 17 | Location/best-seller engine | ⏳ Pending |
| Phase 18 | Security hardening | ⏳ Pending |
| Phase 19 | Testing | ⏳ Pending |
| Phase 20 | Production deployment | ⏳ Pending |
| Phase 21 | Final production audit | ⏳ Pending |

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
| Payments | Razorpay |
| Marketplace Settlement | Razorpay Route |
| Object Storage | Cloudflare R2 / AWS S3 |
| Email | Resend |
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

# Run migrations (creates all tables)
npm run db:migrate

# (Optional) Seed initial data
npm run db:seed
```

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
│   └── migrations/         # Auto-generated migration history
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

# Database commands
npm run db:generate     # Regenerate Prisma client after schema changes
npm run db:migrate      # Create and apply new migration
npm run db:migrate:deploy  # Apply migrations in production
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

**Target architecture:**
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

> **KYC/Legal** — Seller KYC requirements follow applicable Indian regulations. The KYC structure is implemented per Razorpay's onboarding flow. Validate with a legal professional before processing real KYC data.

> **Tax/GST** — The GST architecture is implemented but tax rates are configurable and NOT hard-coded. Validate with a qualified Indian tax professional before processing taxed transactions.

---

*UrbanNest — Build in progress. Not yet in production.*
