import type { EnvVarType } from "../types/EnvVarType";

/**
 * Custom preprocessing functions to preprocess values before submitting to schema processors.
 * If null or undefined, the preprocessing step is skipped for that type.
 * These functions do not guarantee type casting and can be nullified to skip preprocessing.
 */
export interface PreprocessorOptions {
  /**
   * Custom string preprocessing function
   * Receives the string value and should return a string value
   * @param value - The raw string value from the environment variable
   * @returns Preprocessed string value
   */
  string?: null | undefined | ((value: string) => string);

  /**
   * Custom number preprocessing function
   * Receives the string value and should return a string or the target number type
   * @param value - The raw string value from the environment variable
   * @returns Preprocessed string or number value
   */
  number?: null | undefined | ((value: string) => number | string);

  /**
   * Custom boolean preprocessing function
   * Receives the string value and should return a string or the target boolean type
   * @param value - The raw string value from the environment variable
   * @returns Preprocessed string or boolean value
   */
  bool?: null | undefined | ((value: string) => boolean | string);

  /**
   * Custom enum preprocessing function
   * Receives the string value and should return a string value
   * @param value - The raw string value from the environment variable
   * @returns Preprocessed string value
   */
  enum?: null | undefined | ((value: string) => string);
}

/**
 * Individual preprocessor function for a specific type
 */
export type TypedPreprocessor<T> = (value: string) => T | string;

/**
 * Default number preprocessor - removes common formatting like commas
 * Passes through unchanged if it can't be processed
 */
const defaultNumberPreprocessor = (value: string): string => {
  try {
    // Remove commas and whitespace
    const cleaned = value.replace(/,/g, "").trim();
    // Only return the cleaned version if it looks like a number
    if (/^-?\d*\.?\d+$/.test(cleaned)) {
      return cleaned;
    }
  } catch {
    // Pass through on any error
  }
  return value;
};

/**
 * Default boolean preprocessor - handles common boolean representations
 * Passes through unchanged if it can't be processed
 */
const defaultBooleanPreprocessor = (value: string): string => {
  try {
    const cleaned = value.toLowerCase().trim();

    // Handle common truthy values
    if (
      cleaned === "on" ||
      cleaned === "enabled" ||
      cleaned === "active" ||
      cleaned === "yes"
    ) {
      return "true";
    }

    // Handle common falsy values
    if (
      cleaned === "off" ||
      cleaned === "disabled" ||
      cleaned === "inactive" ||
      cleaned === "no"
    ) {
      return "false";
    }
  } catch {
    // Pass through on any error
  }
  return value;
};

/**
 * Apply custom preprocessing functions before schema processing
 * @param value - The raw string value from environment variable
 * @param envVarType - The type of environment variable
 * @param preprocessorOptions - Custom preprocessing options
 * @returns The preprocessed value (could be the target type or still a string)
 */
export function applyPreprocessing<T>(
  value: string,
  envVarType: EnvVarType,
  preprocessorOptions?: PreprocessorOptions,
): T | string {
  let processedValue: string | number | boolean = value;

  // Apply preprocessing based on environment variable type
  switch (envVarType) {
    case "string":
      if (
        preprocessorOptions?.string !== undefined &&
        preprocessorOptions.string !== null
      ) {
        processedValue = preprocessorOptions.string(value);
      }
      // No default preprocessor for strings
      break;
    case "number":
      if (preprocessorOptions?.number !== undefined) {
        // If explicitly null, skip all preprocessing
        if (preprocessorOptions.number !== null) {
          processedValue = preprocessorOptions.number(value);
        }
      } else {
        // Use default number preprocessor when no custom preprocessor provided
        processedValue = defaultNumberPreprocessor(value);
      }
      break;
    case "boolean":
      if (preprocessorOptions?.bool !== undefined) {
        // If explicitly null, skip all preprocessing
        if (preprocessorOptions.bool !== null) {
          processedValue = preprocessorOptions.bool(value);
        }
      } else {
        // Use default boolean preprocessor when no custom preprocessor provided
        processedValue = defaultBooleanPreprocessor(value);
      }
      break;
    case "enum":
      if (
        preprocessorOptions?.enum !== undefined &&
        preprocessorOptions.enum !== null
      ) {
        processedValue = preprocessorOptions.enum(value);
      }
      // No default preprocessor for enums
      break;
  }

  return processedValue as T | string;
}
