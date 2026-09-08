// lib/utils/masking.ts

/**
 * Masks a National ID or Pensioner ID string for public viewing.
 * Example: "12345678" -> "*****678" or "321456" -> "****56"
 */
export function maskNationalId(id: string): string {
    if (!id) return "";
    const visibleLength = Math.min(3, Math.floor(id.length / 2));
    const maskedLength = id.length - visibleLength;

    return "*".repeat(maskedLength) + id.slice(maskedLength);
}