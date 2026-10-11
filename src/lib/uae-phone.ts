/**
 * UAE Mobile Phone Number Validation and Formatting Utilities
 *
 * UAE mobile operators & prefixes:
 * - e& (Etisalat): 050, 054, 056
 * - du & Virgin Mobile: 052, 055, 058
 *
 * Valid mobile formats:
 * - 050 123 4567 (10 digits)
 * - +971 50 123 4567 (with country code)
 * - 00971 50 123 4567
 * - 971 50 123 4567
 */

export function cleanPhoneDigits(phone: string): string {
  if (!phone) return "";
  return phone.replace(/[\s\-\(\)\.]/g, "");
}

/**
 * Validates if the phone number is a valid UAE mobile number.
 */
export function isValidUAEPhone(phone: string): boolean {
  if (!phone) return false;
  const cleaned = cleanPhoneDigits(phone);
  
  // Must match either:
  // - +9715[024568]XXXXXXX (13 chars with +)
  // - 009715[024568]XXXXXXX (14 digits)
  // - 9715[024568]XXXXXXX (12 digits)
  // - 05[024568]XXXXXXX (10 digits)
  // - 5[024568]XXXXXXX (9 digits)
  const uaeRegex = /^(?:\+?971|00971|0)?(5[024568]\d{7})$/;
  return uaeRegex.test(cleaned);
}

/**
 * Formats any valid UAE phone into standardized readable format:
 * `+971 50 123 4567`
 */
export function formatUAEPhone(phone: string): string {
  if (!phone) return "";
  const cleaned = cleanPhoneDigits(phone);
  const match = cleaned.match(/(?:(?:\+?971|00971|0)?)(5[024568]\d{7})$/);
  
  if (match && match[1]) {
    const local = match[1]; // 9 digits: e.g. 501234567
    const op = local.slice(0, 2); // 50
    const part1 = local.slice(2, 5); // 123
    const part2 = local.slice(5); // 4567
    return `+971 ${op} ${part1} ${part2}`;
  }

  return phone.trim();
}

/**
 * Returns user-facing error message if phone is not valid UAE number, or null if valid.
 */
export function validateUAEPhone(phone: string): string | null {
  const trimmed = phone.trim();
  if (!trimmed) {
    return "UAE mobile number is required.";
  }

  const cleaned = cleanPhoneDigits(trimmed);

  if (!isValidUAEPhone(cleaned)) {
    return "Please enter a valid UAE mobile number (e.g. 050 123 4567 or +971 50 123 4567). Supported prefixes: 050, 052, 054, 055, 056, 058.";
  }

  return null;
}
