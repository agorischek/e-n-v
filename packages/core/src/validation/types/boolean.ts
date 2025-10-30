import type { Processor } from "../../processing/types/Processor.js";
import { DEFAULT_BOOLEAN_VALUES } from "../../processing/options/booleanConfig.js";

/**
 * Boolean processor.
 * This is the primary boolean processor - the base booleanProcessor() calls this.
 */
export function boolean(): Processor<boolean> {
  const trueValues = new Set(DEFAULT_BOOLEAN_VALUES.true);
  const falseValues = new Set(DEFAULT_BOOLEAN_VALUES.false);
  
  return (input: string): boolean | undefined => {
    if (typeof input !== "string") {
      throw new Error("Value must be a string");
    }

    const trimmed = input.trim().toLowerCase();

    if (trimmed === "") {
      return undefined;
    }

    if (trueValues.has(trimmed)) {
      return true;
    }

    if (falseValues.has(trimmed)) {
      return false;
    }

    const trueList = [...DEFAULT_BOOLEAN_VALUES.true].join("/");
    const falseList = [...DEFAULT_BOOLEAN_VALUES.false].join("/");
    throw new Error(
      `"${input}" is not a valid boolean. Use: ${trueList} or ${falseList}`,
    );
  };
}
