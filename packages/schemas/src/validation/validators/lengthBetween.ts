import type { Validator } from "../Validator.js";

/**
 * String validator: length within range.
 */
export function lengthBetween(min: number, max: number, requirement?: string): Validator<string> {
  return (value: string) => {
    if (value.length < min || value.length > max) {
      return requirement 
        ? [requirement]
        : [`between ${min} and ${max} characters`];
    }
    return [];
  };
}
