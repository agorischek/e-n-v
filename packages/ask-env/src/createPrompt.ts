import { Readable, Writable } from "node:stream";
import { EnvBooleanPrompt } from "./prompts/EnvBooleanPrompt";
import { EnvEnumPrompt } from "./prompts/EnvEnumPrompt";
import { EnvNumberPrompt } from "./prompts/EnvNumberPrompt";
import { EnvStringPrompt } from "./prompts/EnvStringPrompt";
import type { TypedEnvVarSchema, BooleanEnvVarSchema, NumberEnvVarSchema, EnumEnvVarSchema, StringEnvVarSchema, PreprocessorOptions } from "@envcredible/core";
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
    current: currentValue, // Pass raw current value
    preprocessorOptions, // Pass preprocessor options
  } as const;

  switch (schema.type) {
    case "boolean":
      return new EnvBooleanPrompt(schema, baseOptions);
    case "number":
      return new EnvNumberPrompt(schema, baseOptions);
    case "enum":
      return new EnvEnumPrompt(schema, baseOptions);
    default:
      return new EnvStringPrompt(schema, baseOptions);
  }
}
