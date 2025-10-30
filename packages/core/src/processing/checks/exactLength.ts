import type { Check } from "../types/Check.js";

/**
 * String check: exact length.
 */
export function exactLength(length: number, trait?: string): Check<string> {
  return (value: string) => {
    if (value.length !== length) {
      return trait 
        ? [trait]
        : [`exactly ${length} characters`];
    }
    return [];
  };
}
