# UrbanNest project status

Last reviewed: 2026-10-19

## Implemented in this run

- Seller application form creates a seller profile and inactive store. Customers can apply; marketplace seller routes still require the seller role and an active, unsuspended profile.
- Admin dashboard shows database-backed counts and submitted seller applications. Admin approval/rejection is server-authorized and audit logged. Approval enables the store; it does not mark the store KYC-verified.
- Admin can add categories and submit append-only global commission-rate changes (0–50%, default fallback 10%); both actions are audit logged.
- Approved sellers can create draft products with a variant and inventory, submit for moderation, pause published listings, archive eligible listings, and advance their own orders through allowed fulfilment states. Queries/actions are scoped to seller ownership.
- Admin can publish submitted products or return them to draft. Public catalogue supports category filtering and text search and only shows published products with available stock at a store owned by the product's seller. Product details show real store and variant data.
- Customers can save delivery addresses, add published stock to an authenticated cart, choose an owned saved address, and place COD orders. Checkout reloads authoritative prices/seller/store/stock, groups by seller and store, uses Decimal arithmetic, conditionally decrements stock, creates the parent/suborders/items/payment in a serializable transaction, and clears the cart only on success.
- COD starts as `COD_PENDING` while the order is confirmed. Sellers advance fulfilment; the parent status reflects seller suborders. An admin can record a delivered COD collection only when the reported amount exactly matches, with a required reference, conditional idempotent payment update and audit record.
- Existing uncommitted homepage/authentication/docs changes from the prior run are preserved. Auth still rejects inactive/deleted users at sign in.
- Added unit tests for seller authorization, decimal checkout totals, multi-seller grouping, stock availability, and COD unpaid state.

## Current limits

- The schema has no checked-in migrations and no target database was inspected. The new routes require the deployed database to match the existing Prisma schema. No migration was generated or applied; reconcile the actual database first and review any migration before applying it.
- No real database integration or browser workflow was possible/attempted in this run.
- Seller product management currently creates one variant per product; editing price/description/variants, image upload, seller service-area configuration, returns, cancellations/refunds, customer support, notifications, online gateway payments, and seller payouts are not implemented.
- Categories are created by admins; no category seed is included. An empty database needs an admin and categories provisioned through a controlled process.
- Global commission applies only to item subtotal. The current checkout has zero delivery fee, discount, and tax; gateway fees and statutory deductions are not calculated. Suborder snapshots record gross, commission rate/amount, and seller amount. There is no payout ledger or settlement workflow. COD collection reconciliation records admin assertion/reference; it does not independently verify courier remittance.
- Seller application rejection returns the profile to correction-needed state; resubmission/editing and a seller-visible review reason are not implemented.
- Product image URLs are displayed as stored; there is no upload or URL-verification pipeline.
- Rate limiting remains process-local and unsuitable for horizontally scaled production. Production security and financial controls still need review.
- No real provider integrations are configured or claimed live.

## Verification

- `npm test -- --runInBand`: passed, 5 suites / 25 tests. Tests include authorization guards, Decimal totals, seller/store grouping, stock arithmetic, and COD unpaid state. Existing account test logs an expected unauthorized-action console error.
- `npm run type-check`: passed.
- `npm run lint`: passed with no warnings/errors.
- `DATABASE_URL=placeholder DIRECT_URL=placeholder npm run db:validate`: passed; no database connection was made.
- `npm run build`: passed and compiled customer, seller, admin, catalogue, and API routes.
- `git diff --check`: passed.
- Branch remains `main`; changes are uncommitted. No migration or seed was generated or applied; no database target was inspected.

Do not run a migration or seed command against an unknown database.

## Resume point

Next, review the actual local/staging PostgreSQL schema with the owner and prepare a non-destructive migration plan. Then run integration tests against a disposable database, implement seller product editing/image upload and application resubmission, and add end-to-end tests for checkout concurrency and COD reconciliation. Keep online payments and payouts disabled until provider setup and marketplace eligibility are verified.
