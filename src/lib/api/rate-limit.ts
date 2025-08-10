import { type NextRequest } from "next/server";
import { ApiError } from "./errors";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  keyPrefix?: string; // Prefix for rate limit key
}

// In-memory rate limit store (can be replaced with Redis for production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

export async function checkRateLimit(
  request: NextRequest,
  apiKeyId: string,
  config: RateLimitConfig,
): Promise<{
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const key = `${config.keyPrefix || "api"}:${apiKeyId}`;
  const now = Date.now();
  const resetAt = now + config.windowMs;

  let entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    // Create new entry or reset expired one
    entry = { count: 1, resetAt };
    rateLimitStore.set(key, entry);
  } else {
    // Increment existing entry
    entry.count++;
  }

  const allowed = entry.count <= config.max;
  const remaining = Math.max(0, config.max - entry.count);

  return {
    allowed,
    limit: config.max,
    remaining,
    reset: Math.floor(entry.resetAt / 1000), // Convert to Unix timestamp
  };
}

export function addRateLimitHeaders(
  response: Response,
  rateLimitInfo: {
    limit: number;
    remaining: number;
    reset: number;
  },
): void {
  response.headers.set("X-RateLimit-Limit", rateLimitInfo.limit.toString());
  response.headers.set(
    "X-RateLimit-Remaining",
    rateLimitInfo.remaining.toString(),
  );
  response.headers.set("X-RateLimit-Reset", rateLimitInfo.reset.toString());
  response.headers.set("X-RateLimit-Resource", "standard");
}

// Rate limit configurations for different endpoint types
export const rateLimitConfigs = {
  standard: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000,
  },
  bulk: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100,
    keyPrefix: "bulk",
  },
  search: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 500,
    keyPrefix: "search",
  },
};

export async function applyRateLimit(
  request: NextRequest,
  apiKeyId: string,
  configType: keyof typeof rateLimitConfigs = "standard",
): Promise<{
  limit: number;
  remaining: number;
  reset: number;
}> {
  const config = rateLimitConfigs[configType];
  const rateLimitInfo = await checkRateLimit(request, apiKeyId, config);

  if (!rateLimitInfo.allowed) {
    throw new ApiError("RATE_LIMIT_EXCEEDED", {
      limit: rateLimitInfo.limit,
      remaining: 0,
      reset: rateLimitInfo.reset,
      retry_after: rateLimitInfo.reset - Math.floor(Date.now() / 1000),
    });
  }

  return {
    limit: rateLimitInfo.limit,
    remaining: rateLimitInfo.remaining,
    reset: rateLimitInfo.reset,
  };
}
