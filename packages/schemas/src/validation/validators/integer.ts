import type { Validator } from "../Validator.js";

/**
 * Number validator: must be an integer.
 */
export function integer(requirement?: string): Validator<number> {
  return (value: number) => {
    if (!Number.isInteger(value)) {
      return requirement ? [requirement] : ["an integer"];
    }
    return [];
  };
}
