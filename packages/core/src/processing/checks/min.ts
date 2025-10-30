import type { Check } from "../types/Check.js";

/**
 * Number check: minimum value.
 */
export function min(minimum: number, trait?: string): Check<number> {
  return (value: number) => {
    if (value < minimum) {
      return trait 
        ? [trait]
        : [`at least ${minimum}`];
    }
    return [];
  };
}
