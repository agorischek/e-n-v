import type { Check } from "../processing/types/Check.js";

/**
 * String check: maximum length.
 */
export function maxLength(max: number, requirement?: string): Check<string> {
  return (value: string) => {
    if (value.length > max) {
      return requirement 
        ? [requirement]
        : [`at most ${max} characters`];
    }
    return [];
  };
}
