import type { Check } from "../types/Check.js";

/**
 * String check: minimum length.
 */
export function minLength(min: number, trait?: string): Check<string> {
  return (value: string) => {
    if (value.length < min) {
      return trait ? [trait] : [`at least ${min} characters`];
    }
    return [];
  };
}
