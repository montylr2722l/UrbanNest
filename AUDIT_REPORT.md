# UrbanNest codebase audit

**Audit date:** 2026-10-20  
**Scope:** read-only code, migration, documentation, dependency and build audit of the web repository. No application files were changed during the audit. This report was created after confirming no `AUDIT_REPORT.md` existed.

## A. Executive summary

UrbanNest is an early web MVP implementation, not a launch-ready marketplace. The repository now contains real code for customer authentication/account basics, seller application and approval, product moderation, a searchable catalogue, address/cart/checkout, seller fulfilment, and COD reconciliation. Some pure business rules and authorization helpers have unit tests.

The production build, lint, type-check, schema validation, and 25 Jest tests pass. Those checks do not exercise the marketplace against PostgreSQL or verify real checkout, role isolation, concurrency, delivery, or COD reconciliation. Prisma reports a migration script checked into Git, but this audit could not verify its state on the configured database because `DIRECT_URL` was missing from the Prisma CLI environment. A schema-to-migration diff showed the schema matches the committed migration apart from the generated `public` schema prelude and a final newline.

**Do not launch publicly in the current state.** The resolved dependency tree has one critical and five high vulnerabilities in production dependencies. The installed Next.js version is in an advisory range for unauthenticated remote code execution. Checkout also reads price and listing eligibility before opening the stock/order transaction, so a concurrent seller/admin price or listing change can race checkout. Live database parity, integration tests, financial controls, operations, and the required business processes are not verified or complete.

The current branch is `main`, at `1976f87` (`chore(db): add initial Prisma migration`), aligned with `origin/main`. The working tree was clean at the start and remained clean through checks before this report was added.

## B. Repository and architecture inventory

### Runtime and dependencies

- Node.js `v22.23.1`; npm `10.9.8`.
- Next.js `15.3.3`, React `19.3.0`, TypeScript `5.9.3`, Prisma/Client `6.19.3`, Auth.js `5.0.0-beta.32`, Tailwind CSS `3.4.19`, Zod `3.25.76`, Jest `29.7.0`, bcryptjs `2.4.3`, decimal.js `10.6.0` (resolved from `npm ls --depth=0`).
- `package.json` declares Next.js 15.3.3, Prisma 6, credentials authentication, Tailwind, and Jest. Its version ranges and the lockfile-resolved versions differ for several packages, as expected for ranged dependencies.
- `npm ls --depth=0` completed; it reported one extraneous package, `@emnapi/runtime@1.11.3`.

### Main modules and routes

- Public pages: `/`, `/catalog`, `/products/[slug]`, `/login`, `/register`.
- Customer pages: `/account`, `/account/profile`, `/account/addresses`, `/account/orders`, `/account/wishlist`, `/cart`.
- Seller pages: `/seller`, `/seller/orders`.
- Admin page: `/admin`.
- Auth API: `/api/auth/[...nextauth]`, `/api/auth/register`.
- Customer/commerce API: `/api/account/addresses`, `/api/cart`, `/api/checkout`.
- Seller API: `/api/seller/apply`, `/api/seller/products`, `/api/seller/products/[id]/status`, `/api/seller/orders/[id]/status`.
- Admin API: seller approval, product moderation, categories, commission settings, and COD collection reconciliation under `/api/admin/...`.
- Shared server utilities: `src/lib/server-auth.ts`, `src/lib/marketplace/authorization.ts`, `src/lib/marketplace/checkout.ts`, and Prisma singleton `src/lib/prisma.ts`.

Server-rendered pages use Prisma directly. Route handlers and server actions handle mutations. There is no separate service layer despite the architecture description in the README.

### Database and migration

`prisma/schema.prisma` defines 30 PostgreSQL tables and marketplace enums for users/roles, seller profiles, stores/service areas, categories, products/variants/images, inventory, addresses, carts, parent/seller orders, payments, commissions, settlements, returns/refunds, reviews, coupons, notifications, and audit logs.

The schema has useful uniqueness and lookup constraints: unique user email/phone, seller profile per user, store/category/product slugs, variant SKU, one cart per user, unique cart line by cart/variant/store, one payment per order, one settlement per seller order, and review/coupon uniqueness. It defines indexes for common ownership/status/lookups. Relations generally cascade for dependent auth/cart/catalogue data and restrict deletion for order/financial records; nullable admin/reference relations often use `SET NULL`.

The committed migration is `prisma/migrations/20261020045533_init/migration.sql` from commit `1976f87`. It creates the schema's tables, enums, indexes, and foreign keys. `prisma migrate diff --from-empty --to-schema-datamodel ...` differed only by Prisma's generated `CREATE SCHEMA IF NOT EXISTS "public"` prelude and a final newline, so the committed migration's table/type definition agrees with the current schema.

The configured `DIRECT_URL` was absent from the Prisma CLI environment: `npx prisma migrate status` stopped at schema configuration with “Environment variable not found: DIRECT_URL.” No live database query or migration-status verification was completed. A prior build detected `.env.local`; its contents were not read. The reported Neon migration/application result in the supplied project context is historical and cannot be independently confirmed here.

### Environment variable names

`.env.example` documents `NEXT_PUBLIC_APP_URL`, `NODE_ENV`, `NEXT_PUBLIC_APP_NAME`, `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `AUTH_URL`, Google OAuth names, Razorpay key/webhook/Route names, R2 storage names, upload limit, email provider names, rate-limit settings, logging/audit settings, feature flags, allowed origins, and `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`. No secret values were inspected. The example still describes Supabase and Razorpay setup although the supplied project context identifies Neon and the current code has no payment integration.

### Git and docs

- Branch: `main`; HEAD and `origin/main`: `1976f87`.
- Recent implementation commit: `2b88f8d feat: implement UrbanNest marketplace`; latest commit adds the initial migration.
- No Git changes existed at audit start. No commits, pushes, or Git history changes were made.
- `PROJECT_STATUS.md` still says no migration is checked in and advises creating one. That is stale after `1976f87`.
- `README.md` also says no migration history exists, lists migration as absent, and its Getting Started section warns against applying migrations despite the committed initial migration. It still describes Supabase as the database, Razorpay/Route as the payment architecture, and links `docs/*.md` files that are not present in the repository. `npm run db:seed` is defined but `prisma/seed.ts` does not exist. `.env.example` contains admin seed names/placeholders despite there being no seed script.
- There are no Android or iOS project files. There is no `docs/` directory or Playwright config/spec in the file inventory.

## C. Quality-check summary

| Command | Result | Notes / limits |
|---|---|---|
| `npm test -- --runInBand` | PASS — 5 suites, 25 tests | One expected `console.error` appears in the unauthorized profile-action test. |
| `npm run type-check` | PASS | `tsc --noEmit`. |
| `npm run lint` | PASS | No warnings or errors. This does not mean no lint rules are bypassed: login/register contain inline disables around `as any`. |
| `DATABASE_URL=<placeholder> DIRECT_URL=<placeholder> npm run db:validate` | PASS | Schema validation only; no connection. |
| `npm run build` | PASS | Production build compiled all listed routes; static generation completed. The build detected `.env.local`, which was not inspected. |
| `git diff --check` | PASS | No whitespace errors before writing this report. |
| `npm ls --depth=0` | PASS | One extraneous package reported. |
| `npx prisma migrate status` | NOT COMPLETED | Blocked by missing `DIRECT_URL`; no database status result. |
| `npm audit --json` | COMPLETED | 48 advisories in all dependencies: 1 critical, 40 high, 7 moderate. The initial sandbox request could not resolve npm; the read-only query completed after network approval. |
| `npm audit --omit=dev --json` | COMPLETED | 6 advisories among production dependencies: 1 critical, 5 high. No package changes were made. |
| `npm run test:e2e` | NOT RUN | No Playwright config/specs exist; the project has no browser workflow harness. |

The 25 tests cover registration endpoint rules, mocked auth/authorization, account profile action behavior, auth UI, pure checkout Decimal/grouping/stock helper behavior, and mocked seller-role authorization. They do **not** call the checkout, seller-approval, product-moderation, or COD-reconciliation handlers against a database. Passing unit tests are not end-to-end or financial integration evidence.

## D. Feature matrix

Statuses use the requested meanings. “Partial” means code exists but end-to-end evidence or important parts are missing. No item is marked working solely because a route/page exists.

| Feature | Status | Evidence and main gaps | Priority |
|---|---|---|---|
| Customer registration | PARTIAL | `src/app/api/auth/register/route.ts`, `src/lib/validations/auth.ts`; tests cover successful and duplicate cases. Duplicate check/create has a race: unique-conflict can become generic 500. Existing-account response enables enumeration. |
| Login/password/session/logout | PARTIAL | `src/auth.ts`, `src/auth.config.ts`, `LogoutButton`; passwords use bcrypt cost 12 and disabled/deleted accounts are rejected. UI login is mocked in tests; no session/cookie integration test, login rate limit, password reset, or email verification. |
| Server authorization / role escalation | PARTIAL | `requireAuth` rereads active/deleted/role from DB; registration hardcodes CUSTOMER; seller/admin handlers recheck roles. Some route ownership behavior remains untested end-to-end. |
| Catalogue/product detail/search | PARTIAL | `src/app/catalog/page.tsx`, `src/app/products/[slug]/page.tsx` query live DB records and stock. No DB-backed verification, pagination, sorting, price/gender filters, or robust image workflow. |
| Variants and stock visibility | PARTIAL | Available stock is shown and checked. Seller creation supports only one variant and stock row; no inventory editor, DB check constraint, or concurrency integration test. |
| Cart | PARTIAL | `src/app/api/cart/route.ts`, `src/app/cart/page.tsx`; authenticated DB cart and add/update via form. No remove/quantity editor, guest cart, or flow tests. |
| Addresses | PARTIAL | Add and checkout selection in account API/page. No edit/delete/default-management workflow; API errors render raw JSON in browser form navigation. |
| Checkout and parent/suborders | PARTIAL | Server uses Decimal, authoritative queries and transactionally creates parent/seller orders/items/payment; stock decrements atomically. No route integration tests/idempotency key. Product state/price are read before the transaction, creating a concurrent change race. No discounts, tax, or delivery fees are implemented (all zero). |
| COD | PARTIAL | Checkout initializes `COD_PENDING`; admin reconciliation requires delivered order and exact amount, conditional update and audit record. Admin entry records an assertion/reference; it does not independently verify courier/seller remittance. No integration test. |
| Order history/tracking | PARTIAL | Customer sees parent/payment/seller-order states. No tracking IDs, proof of delivery, cancellation eligibility, or customer-facing status timeline. |
| Cancellation/returns/refunds | MISSING | Schema models exist, but no customer/admin workflow handlers or UI. |
| Reviews/wishlist | MISSING | Wishlist page explicitly says coming soon; review models only. |
| Mobile/accessibility/support | NOT VERIFIED / MISSING | Tailwind responsive styling exists, but no viewport/accessibility audit or automation. No support/WhatsApp workflow. |
| Seller application/KYC | PARTIAL | Application collects business/store/location/contact and admin can approve/return. No identity/KYC evidence, resubmission/edit flow, verification reason to seller, or seller account suspension admin UI. |
| Store profile | PARTIAL | Initial store created and activated after approval; no profile editing, service-area management, hours, or delivery policy workflow. |
| Seller product management | PARTIAL | Draft, one variant/inventory creation, submit, pause, archive exist. No editing, image upload, variant management, bulk stock, analytics, or seller notifications. |
| Seller order isolation/fulfilment | PARTIAL | `sellerId` ownership filters and allowed transition checks in `src/app/api/seller/orders/[id]/status/route.ts`; parent status updated transactionally. No route tests, delivery details/proof, cancellation/return path, or notification. Schema lacks an FK from `SellerOrder.sellerId` to seller profile. |
| Admin access/moderation | PARTIAL | Admin page and APIs re-check ADMIN in DB; seller/product decisions/categories/rates audit logged. No bootstrap procedure, searchable audit history, seller suspension, support/complaint flow, or full order console. |
| Commission | PARTIAL | Global percent can be changed; Decimal commission and seller amount snapshots recorded on suborders. No category/seller/product-specific rules in checkout, no item-level snapshots, no discount/tax/gateway-fee policy or financial ledger. |
| Settlements/payouts | MISSING | Settlement model only; no preparation, reconciliation, history UI, payout provider, or ledger workflow. |
| Online payments/webhooks | MISSING | No provider client, order-creation flow, raw-body signature handler, event idempotency, or online payment route. Razorpay env names in example are not evidence of integration. |
| Android/iOS | MISSING | No mobile application code; requires separate project and estimates. |

## E. Security and production-readiness findings

| Severity | Finding and evidence | Impact / recommendation |
|---|---|---|
| **P0 — Critical** | Resolved `next@15.3.3` is in npm’s critical affected range for unauthenticated RCE in the React Flight protocol ([GHSA-9qr9-h5gf-34mp](https://github.com/advisories/GHSA-9qr9-h5gf-34mp)); npm audit offers Next `15.5.28` as a non-major fix. Further critical Next advisories are also reported by the audit, including image optimization AVIF and Windows server RCE. | Do not expose this build publicly. Plan a compatible patched Next update and lockfile review, then run tests/build and inspect the resulting advisory report. No upgrade was made during this audit. |
| **P1 — High** | `src/app/api/checkout/route.ts` reads listing status, seller/store, stock and price before beginning `$transaction`; transaction only conditionally decrements stock. | Atomic decrement is good for overselling, but concurrent price/status changes may still place an order at a stale price or for a listing paused after the read. Revalidate authoritative records and write under a single transaction/isolation strategy; add integration/concurrency tests and idempotency. |
| **P1 — High** | `src/lib/utils/rate-limit.ts` is an in-process `Map`; registration trusts `x-forwarded-for`; credentials login has no rate limit in `src/auth.ts`. | Horizontal instances or spoofed headers can bypass registration throttling; login is susceptible to brute force. Use trusted proxy IP extraction and distributed throttling for login/register. |
| **P1 — High (release blocker)** | Migration presence is verified locally but current remote database migration status was not: Prisma CLI could not configure without `DIRECT_URL`. No integration test DB is configured. | Do not infer the Neon database is current from this audit or historical claims. Verify with owner-approved read-only status, and exercise migration on a disposable PostgreSQL database before production changes. |
| **P1 — High (dependency)** | Production-only audit found 6 advisories (1 critical, 5 high), including direct `next`, `prisma`, and `sharp` plus transitive `@prisma/config`, `deepmerge-ts`, and `postcss`. | Patch dependency advisories in a separate reviewed task; avoid `npm audit fix --force`. |
| **P2 — Medium** | No CSP or HSTS headers in `next.config.ts`; current headers include X-Frame-Options, nosniff, Referrer-Policy and legacy X-XSS-Protection. | Add a tested production CSP and HSTS after deployment topology/origin decisions. |
| **P2 — Medium** | Registration explicitly returns 409 for existing email, and the check/create sequence is not atomic (`src/app/api/auth/register/route.ts`). | Enables account enumeration and concurrent duplicate requests can return 500. Prefer privacy-consistent responses and map unique constraint errors safely. |
| **P2 — Medium** | `as any` with local lint suppression remains in `src/app/login/page.tsx` and `src/app/register/page.tsx`. | Weakens typed-route checking at navigation points and contradicts the config's no-explicit-any rule. Replace with typed route-safe navigation. |
| **P2 — Medium** | Several form posts return JSON errors from route handlers while success redirects; plain HTML navigation can show raw JSON instead of inline feedback. | Improve customer/seller/admin error states and test validation failures. |
| **P2 — Medium** | Image URLs have no upload/URL validation pipeline; security headers and monitoring are incomplete; logs use `console.error`. | Validate uploads/host allowlists before enabling user-provided images; add structured logging and error monitoring. |

No unsafe SQL interpolation was found in checkout: the raw inventory update uses Prisma's tagged `$executeRaw` template. The conditional SQL checks available inventory in the update itself. No `dangerouslySetInnerHTML` use was found. Authenticated sensitive handlers use server-side DB checks. This is positive code-review evidence, not a complete penetration test.

## F. Practical end-to-end test plan

Use a disposable local PostgreSQL database generated from the migration; create synthetic test accounts and products. Never use Neon production data or real payment credentials. A missing test DB is an external setup requirement. No workflow below was executed end-to-end in this audit.

| Workflow | Preconditions and steps | Expected result | Actual in this audit |
|---|---|---|---|
| Customer registration/login | Test DB; create a new synthetic account, duplicate registration, sign in with correct/incorrect passwords, sign out, try inactive/deleted account. | Password hash only in DB; duplicate handled safely; invalid/disabled login fails; session ends on logout. | Unit/UI mocks pass; real session and login-provider flow not run. |
| Browse products | Approved synthetic seller, category, published product, variant and inventory; search/category filter then open detail. | Only published eligible in-stock items display with real prices/options. | Build passes; database browse not run. |
| Cart/address | Log in as customer, create address, add a variant, try quantity beyond available. | Address is scoped to customer; cart persists; invalid stock rejected; totals re-read at checkout. | Pure stock helper tested; APIs not database-tested. |
| Multi-seller COD checkout | Seed two approved sellers/stores with distinct variants and adequate inventory; choose owned address, place COD. | One parent order, two seller suborders, immutable price/address snapshots; inventory decreases; payment/order payment state remains COD_PENDING. | Decimal/grouping/COD helper tests pass; transaction not exercised against PostgreSQL. |
| Seller fulfillment and isolation | Two sellers, orders for both; authenticate as seller A, read/update own order and attempt seller B's order ID. | Only own order visible/changeable; valid transitions update parent state; invalid transitions rejected. | Authorization helper mock passes; endpoint/database behavior not exercised. |
| Admin moderation | Customer attempts admin endpoints; admin approves seller and submitted product. | Customer forbidden; admin actions audited; seller/store becomes active; product becomes published. | Code review/build only; no handler integration test. |
| COD reconciliation | Delivered synthetic COD order; try mismatch, valid amount/reference, duplicate submission. | Mismatch rejected; exact amount changes payment to COD_COLLECTED once and creates audit entry; retry rejected. | Not executed; no DB integration. |
| Online payments/webhooks | Not applicable yet. | Add provider sandbox, raw-body signature tests, duplicate event tests, server-authoritative status, no real payouts. | Missing integration; no credentials used. |
| Returns/refunds/cancellation | Not implemented. | Define eligibility/state rules, restore inventory and ledger reversal, enforce ownership and idempotency. | Not executed; routes missing. |
| Role restrictions | Customer/seller/admin accounts; try cross-role page and API access, including guessed IDs. | Server DB authorization blocks cross-role/other-owner access. | Existing auth unit tests and seller helper tests pass; no E2E/IDOR test. |

## G. Completion estimates

These are rough feature-weight estimates, not line-count metrics. They compare the repository to a launchable multi-vendor web MVP with verified data flows, operations, and finance. Uncertainty is high because database integration and real workflows were not run.

| Area | Estimate | Basis |
|---|---:|---|
| Current web application implementation | **35–45%** | Core account, seller, catalogue, cart, COD and basic admin flows exist, but editing, cancellation/refunds, finance/payouts, KYC, uploads, UX feedback, integrations and live DB verification are missing. |
| Automated tests and verification | **20–30%** | 25 unit/UI tests and successful static/build checks; no route/database integration or E2E suite, no live migration status. |
| Production readiness | **10–20%** | Critical Next advisory, no verified DB parity, incomplete financial/security/operations workflows, no deployment/backup/monitoring verification. |
| Android app | **0%** | No mobile project. A shared API contract and product/operations requirements would be prerequisites. |
| iOS app | **0%** | No mobile project; same prerequisite uncertainty as Android. |

## H. Prioritized roadmap

| # / Priority | Objective and likely modules | Dependencies | Acceptance criteria and tests | Effort |
|---|---|---|---|---:|
| 1 / P0 | Patch Next.js and affected production dependencies; update lockfile and review `npm audit`. | Compatibility review; no forced bulk upgrade. | Critical/high runtime advisories addressed or documented; Jest, lint, type-check, build pass; repeat production audit. | 0.5–1.5 days |
| 2 / P1 | Verify database migration parity and fresh-database migration using a disposable PostgreSQL DB; reconcile README/PROJECT_STATUS and seed instructions. | Secure `DIRECT_URL` supplied through the approved local environment; never expose it. | Read-only Neon `migrate status` confirms expected state; disposable DB migrates from empty; no destructive operation on Neon. | 0.5–1.5 days |
| 3 / P1 | Add Prisma integration tests for seller application/approval, product moderation, address ownership, cart and COD reconciliation. | Isolated test database and migration workflow. | Tests run against disposable DB; unauthorized IDs denied; failed transaction leaves no partial order/stock changes. | 2–4 days |
| 4 / P1 | Move checkout listing/price/stock validation into transaction; add retry-safe idempotency and explicit stock constraints/invariant handling. | Integration DB; migration review if constraints/keys change. | Concurrent checkout test never oversells; price/listing race rejected; duplicate request cannot create duplicate parent orders; all money Decimal. | 2–4 days |
| 5 / P1 | Implement seller product editing, multiple variants, inventory adjustment, validated image upload/storage. | Seller UX, storage provider choice, migration review if needed. | Owner-only edit tests; nonnegative stock; safe image MIME/size/host policy; moderation re-review for material changes. | 3–6 days |
| 6 / P1 | Implement customer cancellation and returns/refunds with order transitions, inventory restock, and auditable reversals. | Business policy; refund/payment provider policy; integration tests. | Eligibility enforced; no duplicate restock/refund; COD vs online behavior covered; customer/seller isolation tests. | 4–7 days |
| 7 / P1 | Build seller payable/commission/COD reconciliation ledger and settlement preparation (no real payout initiation). | Accounting policy for taxes, shipping, discounts, gateway fees and returns. | Reproducible ledger entries/reversals reconcile to order snapshots; idempotent COD reconciliation; no fake paid payout status. | 3–6 days |
| 8 / P1 | Harden credentials abuse and registration errors; add distributed rate limiting, secure proxy IP handling, structured logs and CSP/HSTS. | Hosting/proxy topology and CSP source inventory. | Login/register brute-force tests, trusted IP extraction, response privacy review, CSP report-only then enforce, security-header tests. | 2–4 days |
| 9 / P2 | Complete product/customer support UX, sorting/pagination, address edit/delete, order detail timeline, notifications. | APIs and policy copy. | No dead buttons; accessible keyboard/form states; responsive manual and automated checks. | 4–8 days |
| 10 / P1 | Controlled pilot preparation: admin bootstrap, deployment secrets, backups/restore, monitoring, incident and support procedures; run browser/UAT with synthetic users. | Prior P0/P1 work, owner/provider approvals. | Restore drill; staged deployment; security review; no public launch until criticals closed and customer/seller workflows signed off. | 3–6 days |

For mobile apps, first stabilize authentication/API contracts and marketplace operations; then scope native or cross-platform clients separately with device testing and mobile security review.

## I. Final recommendation

Continue development, but fix the P0 Next.js advisory before any public exposure. Then verify database/migration state against Neon without changing it, and create an isolated PostgreSQL integration-test environment. Do not begin a public pilot until checkout races, role isolation, COD reconciliation, financial policy, and the missing cancellation/refund and operational procedures are tested and agreed.
