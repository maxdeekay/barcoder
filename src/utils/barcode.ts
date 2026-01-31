/**
 * Validates EAN-13, EAN-8, and UPC-A barcodes using their check digit.
 * These are the standard barcode formats found on grocery items.
 */
export function isValidBarcode(code: string): boolean {
  if (!/^\d+$/.test(code)) return false;

  // EAN-13 (13 digits), EAN-8 (8 digits), UPC-A (12 digits)
  if (code.length !== 13 && code.length !== 8 && code.length !== 12) {
    return false;
  }

  const digits = code.split("").map(Number);
  const checkDigit = digits.pop()!;

  const sum = digits.reduce((acc, digit, i) => {
    // EAN/UPC checksum: alternate multipliers of 1 and 3
    const weight = i % 2 === 0 ? 1 : 3;
    return acc + digit * weight;
  }, 0);

  const expected = (10 - (sum % 10)) % 10;
  return checkDigit === expected;
}
