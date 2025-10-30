import type { Check } from "../Check.js";

/**
 * String check: exact length.
 */
export function exactLength(length: number, requirement?: string): Check<string> {
  return (value: string) => {
    if (value.length !== length) {
      return requirement 
        ? [requirement]
        : [`exactly ${length} characters`];
    }
    return [];
  };
}
