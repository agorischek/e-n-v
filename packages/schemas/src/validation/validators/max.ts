import type { Validator } from "../Validator.js";

/**
 * Number validator: maximum value.
 */
export function max(maximum: number, requirement?: string): Validator<number> {
  return (value: number) => {
    if (value > maximum) {
      return requirement 
        ? [requirement]
        : [`at most ${maximum}`];
    }
    return [];
  };
}
