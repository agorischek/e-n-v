import type { Check } from "../Check.js";

/**
 * Number check: must be an integer.
 */
export function integer(requirement?: string): Check<number> {
  return (value: number) => {
    if (!Number.isInteger(value)) {
      return requirement ? [requirement] : ["an integer"];
    }
    return [];
  };
}
