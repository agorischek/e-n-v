import type { Processor } from "../../processing/Processor.js";

/**
 * Boolean processor.
 * This is the primary boolean processor - the base booleanProcessor() calls this.
 */
export function boolean(): Processor<boolean> {
  return (input: string): boolean | undefined => {
    if (typeof input !== "string") {
      throw new Error("Value must be a string");
    }

    const trimmed = input.trim().toLowerCase();

    if (trimmed === "") {
      return undefined;
    }

    if (
      trimmed === "true" ||
      trimmed === "1" ||
      trimmed === "yes" ||
      trimmed === "on"
    ) {
      return true;
    }

    if (
      trimmed === "false" ||
      trimmed === "0" ||
      trimmed === "no" ||
      trimmed === "off"
    ) {
      return false;
    }

    throw new Error(
      `"${input}" is not a valid boolean. Use: true/false, 1/0, yes/no, or on/off`,
    );
  };
}
