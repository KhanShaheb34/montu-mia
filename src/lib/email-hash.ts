import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Get the unsubscribe secret from environment variables.
 * Throws an error if the secret is not set.
 */
function getUnsubscribeSecret(): string {
  const secret = process.env.UNSUBSCRIBE_SECRET;
  if (!secret) {
    throw new Error("UNSUBSCRIBE_SECRET environment variable is not set");
  }
  return secret;
}

/**
 * Generate a secure hash for email verification.
 * Computes the full HMAC-SHA256 hex digest of the email, keyed by the secret.
 * Throws if UNSUBSCRIBE_SECRET is missing.
 */
export function generateEmailHash(email: string): string {
  const secret = getUnsubscribeSecret();
  return createHmac("sha256", secret).update(email).digest("hex");
}

/**
 * Legacy hash format used in unsubscribe links sent before the HMAC
 * migration: sha256(email + secret) truncated to 16 hex chars. Kept only
 * so links from already-delivered newsletters keep working.
 */
function generateLegacyEmailHash(email: string): string {
  const secret = getUnsubscribeSecret();
  return createHash("sha256")
    .update(email + secret)
    .digest("hex")
    .substring(0, 16);
}

/**
 * Constant-time string comparison. Length mismatch returns false
 * (timingSafeEqual requires equal-length buffers).
 */
function safeEqual(expected: string, actual: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);
  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }
  return timingSafeEqual(expectedBuffer, actualBuffer);
}

/**
 * Verify an email hash against the current HMAC format, falling back to
 * the legacy format for links sent before the migration.
 */
export function verifyEmailHash(email: string, hash: string): boolean {
  try {
    return (
      safeEqual(generateEmailHash(email), hash) ||
      safeEqual(generateLegacyEmailHash(email), hash)
    );
  } catch (error) {
    console.error("Hash verification failed:", error);
    return false;
  }
}
