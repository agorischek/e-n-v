import type {
  EnvVarSchemaDetails,
  Preprocessor,
  Preprocessors,
} from "@e-n-v/core";
import { resolvePreprocessor } from "@e-n-v/core";
import type { ProcessingResult } from "./ProcessingResult";

export type { ProcessingResult } from "./ProcessingResult";

/**
 * Process a value through schema validation and return detailed results
 */
export function processValue<T>(
  envKey: string,
  value: string | undefined,
  schema: EnvVarSchemaDetails<T>,
  preprocess?: Preprocessor<T> | boolean,
): ProcessingResult<T> {
  try {
    // Handle undefined/empty values early
    if (!value || value.trim() === "") {
      return { value: undefined, rawValue: value, isValid: true };
    }

    // Apply preprocessing
    const activePreprocessor = (() => {
      if (preprocess === false) {
        return undefined;
      }

      if (preprocess === true) {
        return resolvePreprocessor(schema.type, {
          [schema.type]: true,
        } as Preprocessors);
      }

      if (typeof preprocess === "function") {
        return preprocess;
      }

      return resolvePreprocessor(schema.type);
    })();
    
    // Apply preprocessor, falling back to original value if it throws
    let processedValue: string | boolean | number | T = value;
    if (activePreprocessor) {
      try {
        processedValue = activePreprocessor(value);
      } catch {
        // Preprocessor failed - pass through original value
        processedValue = value;
      }
    }

    // Always pass through the schema processor for validation
    // Processor receives the preprocessed value as-is (could be string, number, boolean, or T)
    const result = (schema as any).process(processedValue) as T | undefined;
    return { value: result, rawValue: value, isValid: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // Return the raw value and mark as invalid
    return {
      value: undefined,
      rawValue: value,
      isValid: false,
      error: message,
    };
  }
}
