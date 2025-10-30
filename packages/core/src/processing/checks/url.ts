import type { Check } from "../types/Check.js";

/**
 * String check: valid URL.
 */
export function url(requirement?: string): Check<string> {
  return (value: string) => {
    try {
      new URL(value);
      return [];
    } catch {
      return requirement ? [requirement] : ["a valid URL"];
    }
  };
}
