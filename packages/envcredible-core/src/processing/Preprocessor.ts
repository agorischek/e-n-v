import type { EnvVarType } from "../types/EnvVarType";
import { booleanPreprocessor, numberPreprocessor } from "./preprocessors";

/**
 * Custom preprocessing functions to preprocess values before submitting to schema processors.
 * If null or undefined, the preprocessing step is skipped for that type.
 * These functions do not guarantee type casting and can be nullified to skip preprocessing.
 */
export type Preprocessor<T> = (value: string) => T | string;

export interface Preprocessors {
  /**
   * Custom string preprocessing function
   * Receives the string value and should return a string value
   * @param value - The raw string value from the environment variable
   * @returns Preprocessed string value
   */
  string?: null | undefined | Preprocessor<string>;

  /**
   * Custom number preprocessing function
   * Receives the string value and should return a string or the target number type
   * @param value - The raw string value from the environment variable
   * @returns Preprocessed string or number value
   */
  number?: null | undefined | Preprocessor<number>;

  /**
   * Custom boolean preprocessing function
   * Receives the string value and should return a string or the target boolean type
   * @param value - The raw string value from the environment variable
   * @returns Preprocessed string or boolean value
   */
  bool?: null | undefined | Preprocessor<boolean>;

  /**
   * Custom enum preprocessing function
   * Receives the string value and should return a string value
   * @param value - The raw string value from the environment variable
   * @returns Preprocessed string value
   */
  enum?: null | undefined | Preprocessor<string>;
}

const optionKeyMap = {
  string: "string",
  number: "number",
  boolean: "bool",
  enum: "enum",
} as const;

type DefaultPreprocessor<T extends EnvVarType> = T extends "number"
  ? Preprocessor<number>
  : T extends "boolean"
    ? Preprocessor<boolean>
    : Preprocessor<string>;

function createDefaultPreprocessor<T extends EnvVarType>(
  envVarType: T,
): DefaultPreprocessor<T> | undefined {
  switch (envVarType) {
    case "number":
      return numberPreprocessor() as DefaultPreprocessor<T>;
    case "boolean":
      return booleanPreprocessor() as DefaultPreprocessor<T>;
    default:
      return undefined;
  }
}

/**
 * Resolve the effective preprocessor for a given environment variable type.
 * Respects custom overrides and falls back to built-in defaults (number, boolean).
 */
export function resolvePreprocessor<T extends EnvVarType>(
  envVarType: T,
  preprocessorOptions?: Preprocessors,
): DefaultPreprocessor<T> | undefined {
  const key = optionKeyMap[envVarType];
  const custom = preprocessorOptions?.[key];

  if (custom === null) {
    return undefined;
  }

  if (custom !== undefined) {
    return custom as DefaultPreprocessor<T>;
  }

  return createDefaultPreprocessor(envVarType);
}
