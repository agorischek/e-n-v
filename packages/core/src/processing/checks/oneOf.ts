import type { Check } from "../types/Check.js";

/**
 * String check: value must be one of the provided values.
 */
export function oneOf<T extends string>(values: readonly T[], trait?: string): Check<string> {
  return (value: string) => {
    if (!values.includes(value as T)) {
      return trait 
        ? [trait]
        : [`one of: ${values.join(", ")}`];
    }
    return [];
  };
}
