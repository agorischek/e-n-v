import type { EnvVarSchemaDetails, PreprocessorOptions } from "@envcredible/core";
import { applyPreprocessing } from "@envcredible/core";

export interface ProcessingResult<T> {
  value: T | undefined;
  rawValue?: string;
  isValid: boolean;
  error?: string;
}

/**
 * Process a value through schema validation and return detailed results
 */
export function processValue<T>(
  value: string,
  schema: EnvVarSchemaDetails<T>,
  preprocessorOptions?: PreprocessorOptions
): ProcessingResult<T> {
  try {
    // Apply preprocessing
    const processedValue = applyPreprocessing(value, schema.type, preprocessorOptions);

    // If the preprocessing function returned the target type, use it directly
    if (schema.type === "boolean" && typeof processedValue === "boolean") {
      return { value: processedValue as T, rawValue: value, isValid: true };
    }
    if (schema.type === "number" && typeof processedValue === "number") {
      return { value: processedValue as T, rawValue: value, isValid: true };
    }

    // If it's still a string, pass it through the schema processor
    if (typeof processedValue === "string") {
      const result = (schema as any).process(processedValue) as T | undefined;
      return { value: result, rawValue: value, isValid: true };
    }

    // Fallback to original schema processing
    const result = (schema as any).process(value) as T | undefined;
    return { value: result, rawValue: value, isValid: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // Return the raw value and mark as invalid
    return { value: undefined, rawValue: value, isValid: false, error: message };
  }
}