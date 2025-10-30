import type { Check } from "../processing/types/Check.js";

/**
 * String check: minimum length.
 */
export function minLength(min: number, requirement?: string): Check<string> {
  return (value: string) => {
    if (value.length < min) {
      return requirement 
        ? [requirement]
        : [`at least ${min} characters`];
    }
    return [];
  };
}
