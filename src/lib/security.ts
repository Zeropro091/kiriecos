/**
 * Lightweight, zero-dependency cryptographic hash helper for client-side password verification.
 * Converts input string into a standard SHA-256 hex string via Web Crypto API.
 */
export async function sha256(message: string): Promise<string> {
  const clean = message.trim();
  const msgBuffer = new TextEncoder().encode(clean);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Normalizes Indonesian phone number for consistent hashing.
 * Strips non-digits, converts leading '62' to '0', etc.
 */
export function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('62')) {
    digits = '0' + digits.slice(2);
  }
  return digits;
}
