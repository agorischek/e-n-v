/**
 * Helper utility to convert trait descriptions to Zod error messages.
 * Traits are descriptive fragments (e.g., "3 characters long")
 * Zod messages need complete sentences (e.g., "Must be 3 characters long")
 */

/**
 * Converts a trait to a Zod error message by adding "Must " prefix.
 * @param trait - The trait description (e.g., "at least 8 characters long")
 * @returns A complete error message (e.g., "Must be at least 8 characters long")
 */
export function toZodMessage(trait: string): string {
  return `Must ${trait}`;
}

/**
 * Converts a trait array to a Zod error message by joining with "and" and adding "Must " prefix.
 * @param traits - Array of trait descriptions
 * @returns A complete error message joining all traits
 */
export function toZodMessageArray(traits: readonly string[]): string {
  if (traits.length === 0) {
    return "Must satisfy requirements";
  }
  if (traits.length === 1) {
    return toZodMessage(traits[0]!);
  }
  const lastTrait = traits[traits.length - 1]!;
  const otherTraits = traits.slice(0, -1);
  return `Must ${otherTraits.join(", ")} and ${lastTrait}`;
}

/**
 * Converts multiple traits to Zod error messages.
 * @param traits - Object containing trait descriptions (strings or arrays)
 * @returns Object with the same keys but values converted to complete messages
 */
export function toZodMessages<
  T extends Record<string, string | readonly string[]>,
>(traits: T): { [K in keyof T]: string } {
  const messages: Record<string, string> = {};
  for (const [key, value] of Object.entries(traits)) {
    if (Array.isArray(value)) {
      messages[key] = toZodMessageArray(value);
    } else {
      messages[key] = toZodMessage(value as string);
    }
  }
  return messages as { [K in keyof T]: string };
}
