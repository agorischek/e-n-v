/**
 * Parse boolean from string value
 */
export function parseBoolean(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  return trimmed === "true";
}
