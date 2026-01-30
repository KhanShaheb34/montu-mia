import { createHash } from "crypto";

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
 * Computes SHA256 hex digest and returns the first 16 characters.
 * Throws if UNSUBSCRIBE_SECRET is missing.
 */
export function generateEmailHash(email: string): string {
  const secret = getUnsubscribeSecret();
  return createHash("sha256")
    .update(email + secret)
    .digest("hex")
    .substring(0, 16);
}

/**
 * Verify email hash by comparing it with a freshly generated one.
 */
export function verifyEmailHash(email: string, hash: string): boolean {
  try {
    return generateEmailHash(email) === hash;
  } catch (error) {
    console.error("Hash verification failed:", error);
    return false;
  }
}
