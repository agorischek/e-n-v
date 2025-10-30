import type { Validator } from "../Validator.js";

/**
 * String validator: minimum length.
 */
export function minLength(min: number, requirement?: string): Validator<string> {
  return (value: string) => {
    if (value.length < min) {
      return requirement 
        ? [requirement]
        : [`at least ${min} characters`];
    }
    return [];
  };
}
