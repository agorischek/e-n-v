import type { Check } from "../types/Check.js";

/**
 * Number check: maximum value.
 */
export function max(maximum: number, trait?: string): Check<number> {
  return (value: number) => {
    if (value > maximum) {
      return trait 
        ? [trait]
        : [`at most ${maximum}`];
    }
    return [];
  };
}
