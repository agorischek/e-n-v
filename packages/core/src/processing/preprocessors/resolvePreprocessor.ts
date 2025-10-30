import type { EnvVarType } from "../../types/EnvVarType";
import type { PreprocessorOptions } from "../options/PreprocessorOptions";
import { preprocessors } from "./preprocessors";
import type { Preprocessor } from "../types/Preprocessor";

type DefaultPreprocessor<T extends EnvVarType> = T extends "number"
  ? Preprocessor<number>
  : T extends "boolean"
    ? Preprocessor<boolean>
    : Preprocessor<string>;

// Map of types to their factory functions for default preprocessors
const defaultFactories: Record<
  EnvVarType,
  (() => Preprocessor<unknown>) | undefined
> = {
  number: preprocessors.number,
  boolean: preprocessors.boolean,
  string: undefined,
  enum: undefined,
};

// Map of types to their factory functions for explicit preprocessors
const explicitFactories: Record<EnvVarType, () => Preprocessor<unknown>> = {
  number: preprocessors.number,
  boolean: preprocessors.boolean,
  string: preprocessors.string,
  enum: preprocessors.enum,
};

/**
 * Resolve the effective preprocessor for a given environment variable type.
 * Respects custom overrides and falls back to built-in defaults (number, boolean).
 */
export function resolvePreprocessor<T extends EnvVarType>(
  envVarType: T,
  preprocessorOptions?: PreprocessorOptions,
): DefaultPreprocessor<T> | undefined {
  const override = preprocessorOptions?.[envVarType];

  // No override specified - use default if available
  if (override === undefined) {
    const factory = defaultFactories[envVarType];
    return factory ? (factory() as DefaultPreprocessor<T>) : undefined;
  }

  // Explicitly disabled
  if (override === false) {
    return undefined;
  }

  // Explicitly enabled - use built-in preprocessor
  if (override === true) {
    return explicitFactories[envVarType]() as DefaultPreprocessor<T>;
  }

  // Custom function provided
  if (typeof override === "function") {
    return override as DefaultPreprocessor<T>;
  }

  // Options object provided (only for boolean)
  return preprocessors.boolean(override) as DefaultPreprocessor<T>;
}
