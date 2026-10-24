# UrbanNest project status

Last reviewed: 2026-10-20

## Implemented in this run

- Seller application form creates a seller profile and inactive store. Customers can apply; marketplace seller routes still require the seller role and an active, unsuspended profile.
- Admin dashboard shows database-backed counts and submitted seller applications. Admin approval/rejection is server-authorized and audit logged. Approval enables the store; it does not mark the store KYC-verified.
- Admin can add categories and submit append-only global commission-rate changes (0–50%, default fallback 10%); both actions are audit logged.
- Approved sellers can create draft products with a variant and inventory, submit for moderation, pause published listings, archive eligible listings, and advance their own orders through allowed fulfilment states. Queries/actions are scoped to seller ownership.
- Admin can publish submitted products or return them to draft. Public catalogue supports category filtering and text search and only shows published products with available stock at a store owned by the product's seller. Product details show real store and variant data.
- Customers can save delivery addresses, add published stock to an authenticated cart, choose an owned saved address, and place COD orders. Checkout reloads authoritative prices/seller/store/stock, groups by seller and store, uses Decimal arithmetic, conditionally decrements stock, creates the parent/suborders/items/payment in a serializable transaction, and clears the cart only on success.
- COD starts as `COD_PENDING` while the order is confirmed. Sellers advance fulfilment; the parent status reflects seller suborders. An admin can record a delivered COD collection only when the reported amount exactly matches, with a required reference, conditional idempotent payment update and audit record.
- Existing uncommitted homepage/authentication/docs changes from the prior run are preserved. Auth still rejects inactive/deleted users at sign in.
- Login defaults to the dashboard selected by the authenticated session role and accepts only safe same-origin callback URLs.
- Prisma CLI loads Next.js environment files, including `.env.local`, from the root `prisma.config.ts` for Studio, migrations, validation, and generation.
- Added unit tests for seller authorization, decimal checkout totals, multi-seller grouping, stock availability, and COD unpaid state.

## Current limits

- The repository contains `prisma/migrations/20261020045533_init/migration.sql`, but the configured database migration status could not be verified. Prisma CLI now loads the same environment files as Next.js, including `.env.local`, through `prisma.config.ts`. No migration was generated or applied; confirm the actual database state before planning any schema changes.
- No database-backed marketplace workflow or browser-based Studio model query was completed. Studio startup alone does not verify database connectivity.
- Seller product management currently creates one variant per product; editing price/description/variants, image upload, seller service-area configuration, returns, cancellations/refunds, customer support, notifications, online gateway payments, and seller payouts are not implemented.
- Categories are created by admins; no category seed is included. An empty database needs an admin and categories provisioned through a controlled process.
- Global commission applies only to item subtotal. The current checkout has zero delivery fee, discount, and tax; gateway fees and statutory deductions are not calculated. Suborder snapshots record gross, commission rate/amount, and seller amount. There is no payout ledger or settlement workflow. COD collection reconciliation records admin assertion/reference; it does not independently verify courier remittance.
- Seller application rejection returns the profile to correction-needed state; resubmission/editing and a seller-visible review reason are not implemented.
- Product image URLs are displayed as stored; there is no upload or URL-verification pipeline.
- Rate limiting remains process-local and unsuitable for horizontally scaled production. Production security and financial controls still need review.
- No real provider integrations are configured or claimed live.

## Verification

### Verification (2026-10-20)

- `npm test -- --runInBand`: passed, 6 suites / 37 tests. The account test prints an expected unauthorized-action error to the console.
- `npm run type-check`: passed.
- `npm run lint`: passed; Next.js reports that `next lint` is deprecated for a future major version.
- `npm run build`: passed. Next.js reports the existing `experimental.typedRoutes` config deprecation.
- `env -u DATABASE_URL -u DIRECT_URL npm run db:validate`: passed. Prisma loaded `.env.local` through the config; validation did not connect to the database and printed no secret values.
- `env -u DATABASE_URL -u DIRECT_URL npm run db:generate`: passed with Prisma 6.19.3.
- Prisma Studio: startup passed outside the sandbox using a localhost-only bind. The initial sandbox attempt failed because Node could not enumerate network interfaces. No model query was performed.
- `npx prisma migrate status`: the sandboxed check reached the configured datasource then failed with a schema-engine connection error; an outside-sandbox attempt did not return a final migration status. Database migration state remains unverified; no migration was applied.
- `npm audit --omit=dev`: passed with 0 production vulnerabilities. Full `npm audit` reported 42 development-only advisories (35 high, 7 moderate); no dependency versions were changed to address those findings.
- `git diff --check`: passed. No Prisma schema or migration files were changed; no database write command was run.

Do not run a migration or seed command against an unknown database.

## Resume point

Next, resolve database connectivity and confirm migration status with an owner-approved read-only check. Then run integration tests against a disposable database, implement seller product editing/image upload and application resubmission, and add end-to-end tests for checkout concurrency and COD reconciliation. Keep online payments and payouts disabled until provider setup and marketplace eligibility are verified.
