import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiter for OAuth callback endpoint protection
 *
 * Configuration:
 * - Algorithm: Sliding window (prevents burst attacks)
 * - Limit: 10 requests per 60 seconds per IP
 * - Analytics: Enabled (track usage in Upstash dashboard)
 */
export const oauthRateLimiter = new Ratelimit({
  redis: Redis.fromEnv(), // Reads UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  analytics: true, // Enable Upstash analytics dashboard
  prefix: "ratelimit:oauth", // Redis key prefix for organization
});

/**
 * Extract client IP from Vercel edge network headers
 * Priority: x-forwarded-for → x-real-ip → fallback to localhost
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}
