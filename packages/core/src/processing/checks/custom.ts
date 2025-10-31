import type { Check } from "../types/Check.js";

/**
 * Custom check with user-defined validation function.
 * Can return multiple traits.
 */
export function custom<T>(
  fn: (value: T) => boolean,
  ...traits: string[]
): Check<T> {
  return (value: T) => {
    if (!fn(value)) {
      return traits;
    }
    return [];
  };
}
