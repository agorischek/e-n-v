import type { Check } from "../types/Check.js";

/**
 * String check: length within range.
 */
export function lengthBetween(min: number, max: number, requirement?: string): Check<string> {
  return (value: string) => {
    if (value.length < min || value.length > max) {
      return requirement 
        ? [requirement]
        : [`between ${min} and ${max} characters`];
    }
    return [];
  };
}
