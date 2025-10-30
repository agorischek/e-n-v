import type { EnvVarType } from "../types/EnvVarType";
import type { PreprocessorOptions } from "./options/PreprocessorOptions";
import { preprocessors } from "./preprocessors/preprocessors";
import type { Preprocessor } from "./types/Preprocessor";

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
  envVarType: T
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
  envVarType: T
): DefaultPreprocessor<T> | undefined {
  switch (envVarType) {
    case "number":
      return preprocessors.number() as DefaultPreprocessor<T>;
    case "boolean":
      return preprocessors.boolean() as DefaultPreprocessor<T>;
    case "enum":
      return preprocessors.enum() as DefaultPreprocessor<T>;
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
  preprocessorOptions?: PreprocessorOptions
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
