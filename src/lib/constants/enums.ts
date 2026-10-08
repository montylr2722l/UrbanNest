/**
 * UrbanNest — Domain Enumerations
 *
 * These TypeScript enums mirror the Prisma schema enums.
 * They are used in application logic, validation, and UI.
 *
 * IMPORTANT: Keep these in sync with prisma/schema.prisma enums.
 * When adding a new enum value, update both files.
 */

// ---------------------------------------------------------------------------
// User & Auth
// ---------------------------------------------------------------------------

export const UserRole = {
  CUSTOMER: "CUSTOMER",
  SELLER: "SELLER",
  ADMIN: "ADMIN",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// ---------------------------------------------------------------------------
// Seller
// ---------------------------------------------------------------------------

export const KycStatus = {
  NOT_STARTED: "NOT_STARTED",
  PENDING: "PENDING",
  UNDER_REVIEW: "UNDER_REVIEW",
  VERIFIED: "VERIFIED",
  REJECTED: "REJECTED",
  EXPIRED: "EXPIRED",
} as const;
export type KycStatus = (typeof KycStatus)[keyof typeof KycStatus];

export const SellerOnboardingStatus = {
  PROFILE_INCOMPLETE: "PROFILE_INCOMPLETE",
  PROFILE_SUBMITTED: "PROFILE_SUBMITTED",
  KYC_PENDING: "KYC_PENDING",
  KYC_VERIFIED: "KYC_VERIFIED",
  STORE_CREATED: "STORE_CREATED",
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
} as const;
export type SellerOnboardingStatus =
  (typeof SellerOnboardingStatus)[keyof typeof SellerOnboardingStatus];

export const BusinessType = {
  INDIVIDUAL: "INDIVIDUAL",
  SOLE_PROPRIETORSHIP: "SOLE_PROPRIETORSHIP",
  PARTNERSHIP: "PARTNERSHIP",
  PRIVATE_LIMITED: "PRIVATE_LIMITED",
  LLP: "LLP",
  OTHER: "OTHER",
} as const;
export type BusinessType = (typeof BusinessType)[keyof typeof BusinessType];

export const SellerType = {
  LOCAL_STORE: "LOCAL_STORE",
  ONLINE_SELLER: "ONLINE_SELLER",
  BRAND: "BRAND",
} as const;
export type SellerType = (typeof SellerType)[keyof typeof SellerType];

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export const ProductStatus = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  UNDER_REVIEW: "UNDER_REVIEW",
  APPROVED: "APPROVED",
  PUBLISHED: "PUBLISHED",
  PAUSED: "PAUSED",
  ARCHIVED: "ARCHIVED",
} as const;
export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];

export const ProductGender = {
  MEN: "MEN",
  WOMEN: "WOMEN",
  UNISEX: "UNISEX",
  BOYS: "BOYS",
  GIRLS: "GIRLS",
  KIDS: "KIDS",
} as const;
export type ProductGender = (typeof ProductGender)[keyof typeof ProductGender];

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export const OrderStatus = {
  PENDING_PAYMENT: "PENDING_PAYMENT",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  CONFIRMED: "CONFIRMED",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  PARTIALLY_DELIVERED: "PARTIALLY_DELIVERED",
  CANCELLED: "CANCELLED",
  RETURN_REQUESTED: "RETURN_REQUESTED",
  RETURNED: "RETURNED",
  REFUNDED: "REFUNDED",
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const SellerOrderStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  RETURN_REQUESTED: "RETURN_REQUESTED",
  RETURN_ACCEPTED: "RETURN_ACCEPTED",
  RETURN_REJECTED: "RETURN_REJECTED",
  RETURNED: "RETURNED",
  REFUNDED: "REFUNDED",
} as const;
export type SellerOrderStatus =
  (typeof SellerOrderStatus)[keyof typeof SellerOrderStatus];

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

export const PaymentStatus = {
  PENDING: "PENDING",
  AUTHORIZED: "AUTHORIZED",
  CAPTURED: "CAPTURED",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
  PARTIALLY_REFUNDED: "PARTIALLY_REFUNDED",
  CANCELLED: "CANCELLED",
  COD_PENDING: "COD_PENDING",
  COD_COLLECTED: "COD_COLLECTED",
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PaymentMethod = {
  UPI: "UPI",
  CARD: "CARD",
  NET_BANKING: "NET_BANKING",
  WALLET: "WALLET",
  EMI: "EMI",
  COD: "COD",
  OTHER: "OTHER",
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const PaymentProvider = {
  RAZORPAY: "RAZORPAY",
  COD: "COD",
} as const;
export type PaymentProvider =
  (typeof PaymentProvider)[keyof typeof PaymentProvider];

// ---------------------------------------------------------------------------
// Commission
// ---------------------------------------------------------------------------

export const CommissionRuleType = {
  GLOBAL: "GLOBAL",
  CATEGORY: "CATEGORY",
  SELLER: "SELLER",
  PRODUCT: "PRODUCT",
  PROMOTIONAL: "PROMOTIONAL",
} as const;
export type CommissionRuleType =
  (typeof CommissionRuleType)[keyof typeof CommissionRuleType];

// ---------------------------------------------------------------------------
// Settlements
// ---------------------------------------------------------------------------

export const SettlementStatus = {
  PENDING: "PENDING",
  ELIGIBLE: "ELIGIBLE",
  PROCESSING: "PROCESSING",
  PAID: "PAID",
  FAILED: "FAILED",
  ON_HOLD: "ON_HOLD",
} as const;
export type SettlementStatus =
  (typeof SettlementStatus)[keyof typeof SettlementStatus];

// ---------------------------------------------------------------------------
// Returns & Refunds
// ---------------------------------------------------------------------------

export const ReturnType = {
  RETURN: "RETURN",
  EXCHANGE: "EXCHANGE",
  SIZE_EXCHANGE: "SIZE_EXCHANGE",
} as const;
export type ReturnType = (typeof ReturnType)[keyof typeof ReturnType];

export const ReturnStatus = {
  REQUESTED: "REQUESTED",
  UNDER_REVIEW: "UNDER_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  PICKUP_SCHEDULED: "PICKUP_SCHEDULED",
  PICKED_UP: "PICKED_UP",
  RECEIVED: "RECEIVED",
  QUALITY_CHECK: "QUALITY_CHECK",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;
export type ReturnStatus = (typeof ReturnStatus)[keyof typeof ReturnStatus];

export const RefundStatus = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
} as const;
export type RefundStatus = (typeof RefundStatus)[keyof typeof RefundStatus];

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export const ReviewStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  FLAGGED: "FLAGGED",
} as const;
export type ReviewStatus = (typeof ReviewStatus)[keyof typeof ReviewStatus];

// ---------------------------------------------------------------------------
// Coupons
// ---------------------------------------------------------------------------

export const CouponType = {
  PERCENTAGE: "PERCENTAGE",
  FIXED_AMOUNT: "FIXED_AMOUNT",
} as const;
export type CouponType = (typeof CouponType)[keyof typeof CouponType];

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export const NotificationType = {
  ORDER_CONFIRMED: "ORDER_CONFIRMED",
  ORDER_SHIPPED: "ORDER_SHIPPED",
  ORDER_DELIVERED: "ORDER_DELIVERED",
  ORDER_CANCELLED: "ORDER_CANCELLED",
  RETURN_REQUESTED: "RETURN_REQUESTED",
  RETURN_APPROVED: "RETURN_APPROVED",
  RETURN_REJECTED: "RETURN_REJECTED",
  REFUND_INITIATED: "REFUND_INITIATED",
  REFUND_SUCCESS: "REFUND_SUCCESS",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  SELLER_APPROVED: "SELLER_APPROVED",
  SELLER_REJECTED: "SELLER_REJECTED",
  PRODUCT_APPROVED: "PRODUCT_APPROVED",
  PRODUCT_REJECTED: "PRODUCT_REJECTED",
  SETTLEMENT_PROCESSED: "SETTLEMENT_PROCESSED",
  KYC_STATUS_CHANGE: "KYC_STATUS_CHANGE",
  REVIEW_RECEIVED: "REVIEW_RECEIVED",
  GENERAL: "GENERAL",
} as const;
export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

export const NotificationChannel = {
  IN_APP: "IN_APP",
  EMAIL: "EMAIL",
  SMS: "SMS",
  PUSH: "PUSH",
  WHATSAPP: "WHATSAPP",
} as const;
export type NotificationChannel =
  (typeof NotificationChannel)[keyof typeof NotificationChannel];

// ---------------------------------------------------------------------------
// Audit
// ---------------------------------------------------------------------------

export const AuditAction = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  APPROVE: "APPROVE",
  REJECT: "REJECT",
  SUSPEND: "SUSPEND",
  ACTIVATE: "ACTIVATE",
  VERIFY: "VERIFY",
  PROCESS: "PROCESS",
  CANCEL: "CANCEL",
  REFUND: "REFUND",
  SETTLE: "SETTLE",
  CONFIGURE: "CONFIGURE",
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
} as const;
export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];

// ---------------------------------------------------------------------------
// Application constants
// ---------------------------------------------------------------------------

/** Default commission rate (10%). NOT hard-coded in logic — use CommissionRule lookup. */
export const DEFAULT_COMMISSION_RATE = "0.1000" as const;

/** Default return window in days */
export const DEFAULT_RETURN_WINDOW_DAYS = 7 as const;

/** Default INR currency code */
export const CURRENCY_CODE = "INR" as const;

/** Supported Indian states (for address validation) */
export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;
