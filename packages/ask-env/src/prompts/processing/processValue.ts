import type {
  EnvVarSchemaDetails,
  Preprocessors,
  Preprocessor,
} from "@envcredible/core";
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
  envKey: string,
  value: string | undefined,
  schema: EnvVarSchemaDetails<T>,
  preprocess?: Preprocessor<T> | null,
): ProcessingResult<T> {
  try {
    // Handle undefined/empty values early
    if (!value || value.trim() === "") {
      return { value: undefined, rawValue: value, isValid: true };
    }

    // Apply preprocessing
    const resolvedPreprocessors = createPreprocessorOptions(
      schema.type,
      preprocess,
    );
    const processedValue = applyPreprocessing(
      value,
      schema.type,
      resolvedPreprocessors,
    );

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
    return {
      value: undefined,
      rawValue: value,
      isValid: false,
      error: message,
    };
  }
}

function createPreprocessorOptions<T>(
  type: EnvVarSchemaDetails<T>["type"],
  preprocess: Preprocessor<T> | null | undefined,
): Preprocessors | undefined {
  if (preprocess === undefined) {
    return undefined;
  }

  switch (type) {
    case "string":
      return { string: preprocess as Preprocessors["string"] };
    case "number":
      return { number: preprocess as Preprocessors["number"] };
    case "boolean":
      return { bool: preprocess as Preprocessors["bool"] };
    case "enum":
      return { enum: preprocess as Preprocessors["enum"] };
    default:
      return undefined;
  }
}
