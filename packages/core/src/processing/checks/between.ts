import type { Check } from "../types/Check.js";

/**
 * Number check: value within a range.
 */
export function between(minimum: number, maximum: number, trait?: string): Check<number> {
  return (value: number) => {
    if (value < minimum || value > maximum) {
      return trait 
        ? [trait]
        : [`between ${minimum} and ${maximum}`];
    }
    return [];
  };
}
