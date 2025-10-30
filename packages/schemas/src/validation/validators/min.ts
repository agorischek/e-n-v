import type { Validator } from "../Validator.js";

/**
 * Number validator: minimum value.
 */
export function min(minimum: number, requirement?: string): Validator<number> {
  return (value: number) => {
    if (value < minimum) {
      return requirement 
        ? [requirement]
        : [`at least ${minimum}`];
    }
    return [];
  };
}
