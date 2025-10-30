import type { Check } from "../types/Check.js";

/**
 * String check: regex pattern matching.
 */
export function pattern(regex: RegExp, requirement: string | readonly string[]): Check<string> {
  return (value: string) => {
    if (!regex.test(value)) {
      return Array.isArray(requirement) ? [...requirement] : [requirement];
    }
    return [];
  };
}
