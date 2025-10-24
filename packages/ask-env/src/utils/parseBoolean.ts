/**
 * Parse a boolean value from a string input.
 */
export function parseBoolean(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  return trimmed === "true";
}
