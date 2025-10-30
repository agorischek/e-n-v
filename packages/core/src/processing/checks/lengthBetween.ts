import type { Check } from "../types/Check.js";

/**
 * String check: length within a range.
 */
export function lengthBetween(min: number, max: number, trait?: string): Check<string> {
  return (value: string) => {
    if (value.length < min || value.length > max) {
      return trait 
        ? [trait]
        : [`between ${min} and ${max} characters`];
    }
    return [];
  };
}
