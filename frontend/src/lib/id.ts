/**
 * Generate collision-safe unique IDs.
 * 
 * Format: `prefix-timestamp36-random8`
 * Contoh: `trx-m1abc2d-3e4f5g6h`
 * 
 * Menggantikan pola `prefix-${Date.now()}` yang rentan collision
 * jika 2 request masuk di milidetik yang sama.
 */
export function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomUUID().replace(/-/g, '').slice(0, 8);
  return `${prefix}-${timestamp}-${random}`;
}
