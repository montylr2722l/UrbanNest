/**
 * UrbanNest — Safe Currency / Decimal Utilities
 *
 * NEVER use JavaScript's native floating-point arithmetic for financial
 * calculations. 0.1 + 0.2 === 0.30000000000000004 in JavaScript.
 *
 * All monetary values in the database are stored as PostgreSQL NUMERIC via
 * Prisma's Decimal type, which maps to the `decimal.js` library at runtime.
 *
 * Use these utilities for all currency formatting and arithmetic.
 */

import Decimal from "decimal.js";

// Configure Decimal.js for financial precision
Decimal.set({
  precision: 28, // Sufficient for INR amounts up to billions
  rounding: Decimal.ROUND_HALF_UP, // Standard financial rounding
  toExpNeg: -7,
  toExpPos: 21,
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MoneyInput = Decimal | string | number;

// ---------------------------------------------------------------------------
// Core Arithmetic (use these instead of +, -, *, /)
// ---------------------------------------------------------------------------

export function add(a: MoneyInput, b: MoneyInput): Decimal {
  return new Decimal(a).plus(new Decimal(b));
}

export function subtract(a: MoneyInput, b: MoneyInput): Decimal {
  return new Decimal(a).minus(new Decimal(b));
}

export function multiply(a: MoneyInput, b: MoneyInput): Decimal {
  return new Decimal(a).times(new Decimal(b));
}

export function divide(a: MoneyInput, b: MoneyInput): Decimal {
  const divisor = new Decimal(b);
  if (divisor.isZero()) {
    throw new Error("Division by zero in currency calculation");
  }
  return new Decimal(a).dividedBy(divisor);
}

// ---------------------------------------------------------------------------
// Rounding
// ---------------------------------------------------------------------------

/**
 * Round to 2 decimal places using ROUND_HALF_UP (standard for INR).
 * Use before storing any computed monetary value.
 */
export function roundMoney(value: MoneyInput): Decimal {
  return new Decimal(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

// ---------------------------------------------------------------------------
// Commission Calculation
// ---------------------------------------------------------------------------

/**
 * Calculate commission amount from a base amount and rate.
 * @param amount - Order/item amount (Decimal)
 * @param rate   - Commission rate as fraction (e.g. 0.10 for 10%)
 * @returns Commission amount rounded to 2dp
 */
export function calculateCommission(
  amount: MoneyInput,
  rate: MoneyInput,
): Decimal {
  return roundMoney(multiply(amount, rate));
}

/**
 * Calculate the seller's net amount after commission.
 * @param amount     - Gross seller order amount
 * @param commission - Commission amount to deduct
 * @returns Seller net amount
 */
export function calculateSellerAmount(
  amount: MoneyInput,
  commission: MoneyInput,
): Decimal {
  return roundMoney(subtract(amount, commission));
}

// ---------------------------------------------------------------------------
// Comparison
// ---------------------------------------------------------------------------

export function isGreaterThan(a: MoneyInput, b: MoneyInput): boolean {
  return new Decimal(a).greaterThan(new Decimal(b));
}

export function isLessThan(a: MoneyInput, b: MoneyInput): boolean {
  return new Decimal(a).lessThan(new Decimal(b));
}

export function isEqual(a: MoneyInput, b: MoneyInput): boolean {
  return new Decimal(a).equals(new Decimal(b));
}

export function isZero(value: MoneyInput): boolean {
  return new Decimal(value).isZero();
}

export function isNegative(value: MoneyInput): boolean {
  return new Decimal(value).isNegative();
}

// ---------------------------------------------------------------------------
// Formatting (display only — never use these for calculations)
// ---------------------------------------------------------------------------

const INR_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const INR_FORMATTER_ALWAYS_DECIMAL = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format a monetary value as Indian Rupees for display.
 * Examples: ₹1,499 | ₹99.99 | ₹1,00,000
 */
export function formatINR(value: MoneyInput): string {
  const num = new Decimal(value).toNumber();
  return INR_FORMATTER.format(num);
}

/**
 * Format with always-showing decimals (for receipts, invoices).
 * Example: ₹1,499.00
 */
export function formatINRExact(value: MoneyInput): string {
  const num = new Decimal(value).toNumber();
  return INR_FORMATTER_ALWAYS_DECIMAL.format(num);
}

/**
 * Calculate discount percentage for display.
 * Returns 0 if no meaningful discount.
 */
export function calculateDiscountPercent(
  price: MoneyInput,
  compareAtPrice: MoneyInput,
): number {
  const p = new Decimal(price);
  const c = new Decimal(compareAtPrice);
  if (c.isZero() || c.lessThanOrEqualTo(p)) return 0;
  return Math.round(
    c.minus(p).dividedBy(c).times(100).toNumber(),
  );
}

/**
 * Convert a Prisma Decimal (from DB) to a plain Decimal.js instance.
 * Prisma returns Decimal-compatible objects but they may need re-wrapping.
 */
export function toDecimal(value: MoneyInput): Decimal {
  return new Decimal(value.toString());
}

export { Decimal };
