/**
 * UrbanNest — Shared TypeScript Types
 *
 * This file contains shared types used across frontend and API layers.
 * Prisma-generated types are the source of truth for database shapes.
 * These types extend or compose Prisma types for API responses and UI.
 */

// ---------------------------------------------------------------------------
// API Response Wrapper
// ---------------------------------------------------------------------------

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string[]>;
  };
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// ---------------------------------------------------------------------------
// Session / Auth Context
// ---------------------------------------------------------------------------

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: "CUSTOMER" | "SELLER" | "ADMIN";
}

// ---------------------------------------------------------------------------
// Location Types
// ---------------------------------------------------------------------------

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface AddressSnapshot {
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

// ---------------------------------------------------------------------------
// Product / Variant Types (API response shapes)
// ---------------------------------------------------------------------------

export interface ProductVariantSnapshot {
  size: string | null;
  color: string | null;
  colorHex: string | null;
  sku: string;
}

export interface FashionAttributes {
  pattern?: string;
  fit?: string;
  occasion?: string;
  neckline?: string;
  sleeveType?: string;
  fabricType?: string;
  [key: string]: string | undefined;
}

// ---------------------------------------------------------------------------
// Store Operating Hours
// ---------------------------------------------------------------------------

export type WeekDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface DayHours {
  open: string;  // "HH:mm" 24h format
  close: string; // "HH:mm" 24h format
  isClosed?: boolean;
}

export type OperatingHours = Partial<Record<WeekDay, DayHours>>;

// ---------------------------------------------------------------------------
// Cart Types
// ---------------------------------------------------------------------------

export interface CartSummary {
  totalItems: number;
  subtotal: string; // Formatted INR string
  sellerCount: number;
}

// ---------------------------------------------------------------------------
// Order Types
// ---------------------------------------------------------------------------

export interface OrderSummary {
  subtotal: string;
  deliveryFee: string;
  discount: string;
  taxAmount: string;
  totalAmount: string;
  couponDiscount: string;
}

// ---------------------------------------------------------------------------
// Seller Selection (Best Seller Engine — future)
// ---------------------------------------------------------------------------

export interface SellerEligibilityScore {
  storeId: string;
  sellerId: string;
  distance: number | null;       // km, null if unknown
  hasInventory: boolean;
  servicesLocation: boolean;
  estimatedDeliveryDays: number | null;
  sellerRating: number | null;
  score: number;                 // Composite deterministic score
}

// ---------------------------------------------------------------------------
// File Upload
// ---------------------------------------------------------------------------

export interface UploadedFile {
  url: string;
  key: string;           // Object storage key
  size: number;          // bytes
  mimeType: string;
}

// ---------------------------------------------------------------------------
// Utility Types
// ---------------------------------------------------------------------------

/** Make specific keys required */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/** Make specific keys optional */
export type PartialFields<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

/** Branded type for type-safe IDs */
export type BrandedId<Brand extends string> = string & { __brand: Brand };

export type UserId = BrandedId<"UserId">;
export type ProductId = BrandedId<"ProductId">;
export type OrderId = BrandedId<"OrderId">;
export type StoreId = BrandedId<"StoreId">;
