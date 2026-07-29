import type { Check } from "../types/Check.js";

/**
 * Number check: must be an integer.
 */
export function integer(trait?: string): Check<number> {
  return (value: number) => {
    if (!Number.isInteger(value)) {
      return trait ? [trait] : ["an integer"];
    }
    return [];
  };
}
