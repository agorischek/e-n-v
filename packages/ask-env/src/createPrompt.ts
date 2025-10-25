import { Readable, Writable } from "node:stream";
import { EnvBooleanPrompt } from "./prompts/typed/EnvBooleanPrompt";
import { EnvEnumPrompt } from "./prompts/typed/EnvEnumPrompt";
import { EnvNumberPrompt } from "./prompts/typed/EnvNumberPrompt";
import { EnvStringPrompt } from "./prompts/typed/EnvStringPrompt";
import type { EnvVarSchema, PreprocessorOptions } from "@envcredible/core";
import type { Theme } from "./visuals/Theme";

interface CreatePromptOptions {
  key: string;
  schema: EnvVarSchema;
  currentValue?: string;
  theme: Theme;
  truncate: number;
  shouldMask: boolean;
  index: number;
  total: number;
  input?: Readable;
  output?: Writable;
  preprocessors?: PreprocessorOptions;
}

export function createPrompt({
  key,
  schema,
  currentValue,
  theme,
  truncate,
  shouldMask,
  index,
  total,
  input,
  output,
  preprocessors,
}: CreatePromptOptions):
  | EnvBooleanPrompt
  | EnvNumberPrompt
  | EnvEnumPrompt
  | EnvStringPrompt {
  const baseOptions = {
    key,
    theme,
    truncate,
    index,
    total,
    input,
    output,
  } as const;

  switch (schema.type) {
    case "boolean":
      return new EnvBooleanPrompt(schema, {
        ...baseOptions,
        current: currentValue,
        preprocess: preprocessors?.bool,
      });
    case "number":
      return new EnvNumberPrompt(schema, {
        ...baseOptions,
        current: currentValue,
        preprocess: preprocessors?.number,
      });
    case "enum":
      return new EnvEnumPrompt(schema, {
        ...baseOptions,
        current: currentValue,
        preprocess: preprocessors?.enum,
      });
    default:
      return new EnvStringPrompt(schema, {
        ...baseOptions,
        current: currentValue,
        secret: shouldMask,
        preprocess: preprocessors?.string,
      });
  }
}
