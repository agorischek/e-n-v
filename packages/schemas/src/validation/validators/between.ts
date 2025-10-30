import type { Validator } from "../Validator.js";

/**
 * Number validator: value within range.
 */
export function between(minimum: number, maximum: number, requirement?: string): Validator<number> {
  return (value: number) => {
    if (value < minimum || value > maximum) {
      return requirement 
        ? [requirement]
        : [`between ${minimum} and ${maximum}`];
    }
    return [];
  };
}
