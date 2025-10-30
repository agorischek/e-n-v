import type { Validator } from "../Validator.js";

/**
 * String validator: regex pattern matching.
 */
export function pattern(regex: RegExp, requirement: string | readonly string[]): Validator<string> {
  return (value: string) => {
    if (!regex.test(value)) {
      return Array.isArray(requirement) ? [...requirement] : [requirement];
    }
    return [];
  };
}
