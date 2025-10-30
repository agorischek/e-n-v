import type { Validator } from "../Validator.js";

/**
 * String validator: maximum length.
 */
export function maxLength(max: number, requirement?: string): Validator<string> {
  return (value: string) => {
    if (value.length > max) {
      return requirement 
        ? [requirement]
        : [`at most ${max} characters`];
    }
    return [];
  };
}
