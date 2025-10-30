import type { Check } from "../types/Check.js";

/**
 * String check: valid URL.
 */
export function url(trait?: string): Check<string> {
  return (value: string) => {
    try {
      new URL(value);
      return [];
    } catch {
      return trait ? [trait] : ["a valid URL"];
    }
  };
}
