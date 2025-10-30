import type { EnvVarType } from "../types/EnvVarType";
import {
  preprocessors,
  type BooleanPreprocessorOptions,
} from "./preprocessors";
import type { Preprocessor, PreprocessorToggle } from "./types/Preprocessor";



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
      return preprocessors.number() as DefaultPreprocessor<T>;
    case "boolean":
      return preprocessors.boolean() as DefaultPreprocessor<T>;
    default:
      return undefined;
  }
}

function createExplicitPreprocessor<T extends EnvVarType>(
  envVarType: T,
): DefaultPreprocessor<T> | undefined {
  switch (envVarType) {
    case "number":
      return preprocessors.number() as DefaultPreprocessor<T>;
    case "boolean":
      return preprocessors.boolean() as DefaultPreprocessor<T>;
    case "enum":
      return preprocessors.enumeration() as DefaultPreprocessor<T>;
    case "string":
      return preprocessors.string() as DefaultPreprocessor<T>;
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

    return preprocessors.boolean(override) as DefaultPreprocessor<T>;
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
