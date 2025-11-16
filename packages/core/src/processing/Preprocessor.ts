import type { EnvVarType } from "../types/EnvVarType";
import {
  booleanPreprocessor,
  enumPreprocessor,
  numberPreprocessor,
  stringPreprocessor,
  type BooleanPreprocessorOptions,
} from "./preprocessors";

/**
 * Custom preprocessing functions to preprocess values before submitting to schema processors.
 * Provide `false` to skip preprocessing, `true` to use the built-in default, or a function/options object for custom logic.
 * These functions do not guarantee type casting and can be bypassed to skip preprocessing entirely.
 */
export type Preprocessor<T> = (value: string) => T | string;

type PreprocessorToggle<T> = Preprocessor<T> | boolean | undefined;

export interface Preprocessors {
  /**
   * Custom string preprocessing function
   * Receives the string value and should return a string value
   * @param value - The raw string value from the environment variable
   * @returns Preprocessed string value
   */
  string?: PreprocessorToggle<string>;

  /**
   * Custom number preprocessing function
   * Receives the string value and should return a string or the target number type
   * @param value - The raw string value from the environment variable
   * @returns Preprocessed string or number value
   */
  number?: PreprocessorToggle<number>;

  /**
   * Custom boolean preprocessing function
   * Receives the string value and should return a string or the target boolean type
   * @param value - The raw string value from the environment variable
   * @returns Preprocessed string or boolean value
   */
  boolean?:
    | boolean
    | Preprocessor<boolean>
    | BooleanPreprocessorOptions
    | undefined;

  /**
   * Custom enum preprocessing function
   * Receives the string value and should return a string value
   * @param value - The raw string value from the environment variable
   * @returns Preprocessed string value
   */
  enum?: PreprocessorToggle<string>;
}

const optionKeyMap = {
  string: "string",
  number: "number",
  boolean: "boolean",
  enum: "enum",
  array: "string",
} as const;

type DefaultPreprocessor<T extends EnvVarType> = T extends "number"
  ? Preprocessor<number>
  : T extends "boolean"
    ? Preprocessor<boolean>
    : Preprocessor<string>;

const explicitPreprocessorFactories = {
  string: stringPreprocessor,
  number: numberPreprocessor,
  boolean: booleanPreprocessor,
  enum: enumPreprocessor,
} as const;

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

function createExplicitPreprocessor<T extends EnvVarType>(
  envVarType: T,
): DefaultPreprocessor<T> | undefined {
  const key = envVarType === "array" ? "string" : envVarType;
  const factory = explicitPreprocessorFactories[key];

  if (!factory) {
    return undefined;
  }

  return factory() as DefaultPreprocessor<T>;
}

/**
 * Resolve the effective preprocessor for a given environment variable type.
 * Respects custom overrides and falls back to built-in defaults (number, boolean).
 */
export function resolvePreprocessor<T extends EnvVarType>(
  envVarType: T,
  preprocessorOptions?: Preprocessors,
): DefaultPreprocessor<T> | undefined {
  if (envVarType === "boolean") {
    const override = preprocessorOptions?.boolean;

    if (override === undefined) {
      return createDefaultPreprocessor(envVarType);
    }

    if (override === false) {
      return undefined;
    }

    if (override === true) {
      return createExplicitPreprocessor(envVarType);
    }

    if (typeof override === "function") {
      return override as DefaultPreprocessor<T>;
    }

    return booleanPreprocessor(override) as DefaultPreprocessor<T>;
  }

  const key = optionKeyMap[envVarType];
  const custom = preprocessorOptions?.[key];

  if (custom === undefined) {
    return createDefaultPreprocessor(envVarType);
  }

  if (custom === false) {
    return undefined;
  }

  if (custom === true) {
    return createExplicitPreprocessor(envVarType);
  }

  return custom as DefaultPreprocessor<T>;
}
