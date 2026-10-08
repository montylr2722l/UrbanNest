/**
 * UrbanNest — Structured Error Classes
 *
 * Rules:
 * - NEVER expose stack traces, DB errors, or internal details to clients
 * - Log full errors server-side; return safe messages to clients
 * - Use typed error classes to enable consistent error handling in route handlers
 */

// ---------------------------------------------------------------------------
// Base Application Error
// ---------------------------------------------------------------------------

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode = 500,
    code = "INTERNAL_ERROR",
    isOperational = true,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ---------------------------------------------------------------------------
// 400 — Validation / Bad Request
// ---------------------------------------------------------------------------

export class ValidationError extends AppError {
  public readonly fields?: Record<string, string[]>;

  constructor(message: string, fields?: Record<string, string[]>) {
    super(message, 400, "VALIDATION_ERROR");
    this.fields = fields;
  }
}

// ---------------------------------------------------------------------------
// 401 — Authentication Required
// ---------------------------------------------------------------------------

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "UNAUTHENTICATED");
  }
}

// ---------------------------------------------------------------------------
// 403 — Authorization / Forbidden
// ---------------------------------------------------------------------------

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super(message, 403, "FORBIDDEN");
  }
}

// ---------------------------------------------------------------------------
// 404 — Not Found
// ---------------------------------------------------------------------------

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

// ---------------------------------------------------------------------------
// 409 — Conflict
// ---------------------------------------------------------------------------

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
  }
}

// ---------------------------------------------------------------------------
// 422 — Business Logic / Unprocessable
// ---------------------------------------------------------------------------

export class BusinessError extends AppError {
  constructor(message: string, code = "BUSINESS_RULE_VIOLATION") {
    super(message, 422, code);
  }
}

// Specific business errors
export class InsufficientInventoryError extends BusinessError {
  constructor(variantId?: string) {
    super(
      variantId
        ? `Insufficient inventory for variant ${variantId}`
        : "Insufficient inventory",
      "INSUFFICIENT_INVENTORY",
    );
  }
}

export class PaymentVerificationError extends BusinessError {
  constructor(message = "Payment verification failed") {
    super(message, "PAYMENT_VERIFICATION_FAILED");
  }
}

// ---------------------------------------------------------------------------
// 429 — Rate Limit
// ---------------------------------------------------------------------------

export class RateLimitError extends AppError {
  constructor(message = "Too many requests. Please try again later.") {
    super(message, 429, "RATE_LIMIT_EXCEEDED");
  }
}

// ---------------------------------------------------------------------------
// 503 — External Service Unavailable
// ---------------------------------------------------------------------------

export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string) {
    super(
      message ?? `${service} is temporarily unavailable`,
      503,
      "EXTERNAL_SERVICE_ERROR",
    );
  }
}

// ---------------------------------------------------------------------------
// Error Response Serialization
// ---------------------------------------------------------------------------

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string[]>;
  };
}

/**
 * Serialize an error into a safe client-facing API response.
 * Never includes stack traces or internal details.
 */
export function serializeError(error: unknown): ApiErrorResponse {
  if (error instanceof ValidationError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        fields: error.fields,
      },
    };
  }

  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    };
  }

  // Unknown / unexpected errors — never expose internals
  return {
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred. Please try again.",
    },
  };
}

/**
 * Get HTTP status code from an error.
 */
export function getStatusCode(error: unknown): number {
  if (error instanceof AppError) {
    return error.statusCode;
  }
  return 500;
}

/**
 * Type guard — is this a known operational error?
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
