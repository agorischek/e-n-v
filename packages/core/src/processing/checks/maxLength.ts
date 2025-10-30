import type { Check } from "../types/Check.js";

/**
 * String check: maximum length.
 */
export function maxLength(max: number, trait?: string): Check<string> {
  return (value: string) => {
    if (value.length > max) {
      return trait 
        ? [trait]
        : [`at most ${max} characters`];
    }
    return [];
  };
}
