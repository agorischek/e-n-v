import type { Validator } from "../Validator.js";

/**
 * String validator: valid URL.
 */
export function url(requirement?: string): Validator<string> {
  return (value: string) => {
    try {
      new URL(value);
      return [];
    } catch {
      return requirement ? [requirement] : ["a valid URL"];
    }
  };
}
