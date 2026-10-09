/**
 * In-memory rate limiter for authentication endpoints.
 * NOTE: This is suitable ONLY for limited, single-instance development/deployment.
 * For a distributed production environment, this MUST be replaced with a
 * reliable external store like Redis.
 */
const rateLimitCache = new Map<string, { count: number; timestamp: number }>();

export function checkRateLimit(ip: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;

  const record = rateLimitCache.get(ip);
  if (!record || record.timestamp < windowStart) {
    rateLimitCache.set(ip, { count: 1, timestamp: now });
    return true; // Allowed
  }

  if (record.count >= limit) {
    return false; // Rate limited
  }

  record.count += 1;
  return true; // Allowed
}
