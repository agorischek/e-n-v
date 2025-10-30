import type { Check } from "../Check.js";

/**
 * Number check: value within range.
 */
export function between(minimum: number, maximum: number, requirement?: string): Check<number> {
  return (value: number) => {
    if (value < minimum || value > maximum) {
      return requirement 
        ? [requirement]
        : [`between ${minimum} and ${maximum}`];
    }
    return [];
  };
}
