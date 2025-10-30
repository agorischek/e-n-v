import type { Check } from "../processing/types/Check.js";

/**
 * Number check: maximum value.
 */
export function max(maximum: number, requirement?: string): Check<number> {
  return (value: number) => {
    if (value > maximum) {
      return requirement 
        ? [requirement]
        : [`at most ${maximum}`];
    }
    return [];
  };
}
