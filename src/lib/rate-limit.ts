/**
 * Simple in-memory rate limiter for server actions
 * For production, consider using Redis-based rate limiting
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) {
        store.delete(key);
      }
    }
  },
  5 * 60 * 1000,
);

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed within the window
   */
  limit: number;
  /**
   * Time window in milliseconds
   */
  window: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Rate limit a request by identifier
 * @param identifier - Unique identifier for the request (e.g., IP address, email)
 * @param config - Rate limit configuration
 * @returns Result indicating if request is allowed
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig,
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(identifier);

  // No entry or expired entry - create new one
  if (!entry || entry.resetAt < now) {
    const resetAt = now + config.window;
    store.set(identifier, { count: 1, resetAt });
    return {
      success: true,
      remaining: config.limit - 1,
      resetAt,
    };
  }

  // Entry exists and is valid
  if (entry.count >= config.limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  // Increment count
  entry.count += 1;
  store.set(identifier, entry);

  return {
    success: true,
    remaining: config.limit - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Get the client IP address from request headers
 * Works with Vercel and most hosting providers
 */
export function getClientIdentifier(headers: Headers): string {
  // Check common headers for IP address
  const forwardedFor = headers.get("x-forwarded-for");
  const realIp = headers.get("x-real-ip");
  const cfConnectingIp = headers.get("cf-connecting-ip");

  // Return first available IP
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  if (realIp) {
    return realIp;
  }
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback to a generic identifier
  return "unknown";
}
