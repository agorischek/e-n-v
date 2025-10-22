import { Readable, Writable } from "node:stream";
import { EnvBooleanPrompt } from "./prompts/EnvBooleanPrompt";
import { EnvEnumPrompt } from "./prompts/EnvEnumPrompt";
import { EnvNumberPrompt } from "./prompts/EnvNumberPrompt";
import { EnvStringPrompt } from "./prompts/EnvStringPrompt";
import type { TypedEnvVarSchema, BooleanEnvVarSchema, NumberEnvVarSchema, EnumEnvVarSchema, StringEnvVarSchema, PreprocessorOptions } from "@envcredible/core";
import { applyPreprocessing } from "@envcredible/core";
import type { Theme } from "./visuals/Theme";
import type { AskEnvOptions } from "./AskEnvOptions";

interface CreatePromptOptions {
  key: string;
  schema: TypedEnvVarSchema;
  currentValue?: string;
  theme: Theme;
  truncate: number;
  shouldMask: boolean;
  hasPrevious: boolean;
  input?: Readable;
  output?: Writable;
  preprocessorOptions?: PreprocessorOptions;
}

interface ProcessingResult<T> {
  value: T | undefined;
  rawValue?: string;
  isValid: boolean;
  error?: string;
}

/**
 * Process a value through schema validation and return detailed results
 */
function processValue<T>(
  value: string,
  schema: TypedEnvVarSchema,
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

/**
 * Apply custom preprocessing functions before schema processing
 */
export function applyCustomPreprocessing<T>(
  value: string,
  schema: TypedEnvVarSchema,
  preprocessorOptions?: PreprocessorOptions
): T | undefined {
  try {
    // Apply preprocessing
    const processedValue = applyPreprocessing(value, schema.type, preprocessorOptions);

    // If the preprocessing function returned the target type, use it directly
    if (schema.type === "boolean" && typeof processedValue === "boolean") {
      return processedValue as T;
    }
    if (schema.type === "number" && typeof processedValue === "number") {
      return processedValue as T;
    }

    // If it's still a string, pass it through the schema processor
    if (typeof processedValue === "string") {
      return (schema as any).process(processedValue) as T | undefined;
    }

    // Fallback to original schema processing
    return (schema as any).process(value) as T | undefined;
  } catch (error) {
    // Instead of throwing, return undefined and let the UI handle the invalid value
    // The validation error will be shown as an annotation and the user can skip validation
    return undefined;
  }
}

/**
 * Safe version that returns both the result and any validation error
 */
export function applyCustomPreprocessingSafe<T>(
  value: string,
  schema: TypedEnvVarSchema,
  preprocessorOptions?: PreprocessorOptions
): { result: T | undefined; error?: string } {
  try {
    // Apply preprocessing
    const processedValue = applyPreprocessing(value, schema.type, preprocessorOptions);

    // If the preprocessing function returned the target type, use it directly
    if (schema.type === "boolean" && typeof processedValue === "boolean") {
      return { result: processedValue as T };
    }
    if (schema.type === "number" && typeof processedValue === "number") {
      return { result: processedValue as T };
    }

    // If it's still a string, pass it through the schema processor
    if (typeof processedValue === "string") {
      const result = (schema as any).process(processedValue) as T | undefined;
      return { result };
    }

    // Fallback to original schema processing
    const result = (schema as any).process(value) as T | undefined;
    return { result };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { result: undefined, error: message };
  }
}

export function createPrompt({
  key,
  schema,
  currentValue,
  theme,
  truncate,
  shouldMask,
  hasPrevious,
  input,
  output,
  preprocessorOptions,
}: CreatePromptOptions):
  | EnvBooleanPrompt
  | EnvNumberPrompt
  | EnvEnumPrompt
  | EnvStringPrompt {
  const baseOptions = {
    key,
    theme,
    maxDisplayLength: truncate,
    previousEnabled: hasPrevious,
    input,
    output,
  } as const;

  // Process current value if it exists, but don't throw on validation errors
  let processedCurrent: any = undefined;
  let currentValidationError: string | undefined;
  
  if (currentValue !== undefined) {
    const processingResult = processValue(currentValue, schema, preprocessorOptions);
    if (processingResult.isValid) {
      processedCurrent = processingResult.value;
    } else {
      // For invalid values, we want to display the raw value in the UI
      // but mark it as invalid so the user can see it and choose to skip validation
      processedCurrent = processingResult.rawValue;
      currentValidationError = processingResult.error;
    }
  }

  switch (schema.type) {
    case "boolean":
      return new EnvBooleanPrompt(schema as BooleanEnvVarSchema, {
        ...baseOptions,
        current: processedCurrent,
        currentValidationError,
      });
    case "number":
      return new EnvNumberPrompt(schema as NumberEnvVarSchema, {
        ...baseOptions,
        current: processedCurrent,
        currentValidationError,
      });
    case "enum":
      return new EnvEnumPrompt(schema as EnumEnvVarSchema<any>, {
        ...baseOptions,
        current: processedCurrent,
        currentValidationError,
      });
    default:
      return new EnvStringPrompt(schema as StringEnvVarSchema, {
        ...baseOptions,
        current: processedCurrent,
        currentValidationError,
      });
  }
}
