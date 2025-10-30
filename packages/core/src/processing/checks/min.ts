import type { Check } from "../types/Check.js";

/**
 * Number check: minimum value.
 */
export function min(minimum: number, requirement?: string): Check<number> {
  return (value: number) => {
    if (value < minimum) {
      return requirement 
        ? [requirement]
        : [`at least ${minimum}`];
    }
    return [];
  };
}
