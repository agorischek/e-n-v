import type { Check } from "../types/Check.js";

/**
 * String check: regex pattern match.
 */
export function pattern(regex: RegExp, trait: string | readonly string[]): Check<string> {
  return (value: string) => {
    if (!regex.test(value)) {
      return Array.isArray(trait) ? [...trait] : [trait];
    }
    return [];
  };
}
