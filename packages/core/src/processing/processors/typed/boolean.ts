import { FALSE_STRINGS } from "../../constants/FALSE_STRINGS.js";
import { TRUE_STRINGS } from "../../constants/TRUE_STRINGS.js";
import type { Processor } from "../../types/Processor.js";

/**
 * Boolean processor.
 * This is the primary boolean processor - the base booleanProcessor() calls this.
 */
export function boolean(): Processor<boolean> {
  const trueValues = new Set(TRUE_STRINGS);
  const falseValues = new Set(FALSE_STRINGS);
  
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

    const trueList = [...TRUE_STRINGS].join("/");
    const falseList = [...FALSE_STRINGS].join("/");
    throw new Error(
      `"${input}" is not a valid boolean. Use: ${trueList} or ${falseList}`,
    );
  };
}
