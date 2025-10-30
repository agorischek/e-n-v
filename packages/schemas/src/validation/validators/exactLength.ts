import type { Validator } from "../Validator.js";

/**
 * String validator: exact length.
 */
export function exactLength(length: number, requirement?: string): Validator<string> {
  return (value: string) => {
    if (value.length !== length) {
      return requirement 
        ? [requirement]
        : [`exactly ${length} characters`];
    }
    return [];
  };
}
