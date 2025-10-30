import type { Processor } from "@e-n-v/core";

/**
 * Boolean processor.
 * Accepts various boolean-like string values and coerces them to boolean.
 * Accepted truthy values: "true", "1", "yes", "on"
 * Accepted falsy values: "false", "0", "no", "off"
 */
export function boolean(): Processor<boolean> {
  return (input: string): boolean | undefined => {
    const trimmed = input.trim();
    if (trimmed === "") {
      return undefined;
    }
    
    const lower = trimmed.toLowerCase();
    if (lower === "true" || lower === "1" || lower === "yes" || lower === "on") {
      return true;
    }
    if (lower === "false" || lower === "0" || lower === "no" || lower === "off") {
      return false;
    }
    
    throw new Error("Must be 'true' or 'false'");
  };
}
