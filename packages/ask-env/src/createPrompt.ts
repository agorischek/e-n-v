import { Readable, Writable } from "node:stream";
import { EnvBooleanPrompt } from "./prompts/EnvBooleanPrompt";
import { EnvEnumPrompt } from "./prompts/EnvEnumPrompt";
import { EnvNumberPrompt } from "./prompts/EnvNumberPrompt";
import { EnvStringPrompt } from "./prompts/EnvStringPrompt";
import type { TypedEnvVarSchema, BooleanEnvVarSchema, NumberEnvVarSchema, EnumEnvVarSchema, StringEnvVarSchema } from "@envcredible/types";
import type { Theme } from "./visuals/Theme";

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

  switch (schema.type) {
    case "boolean":
      return new EnvBooleanPrompt(schema as BooleanEnvVarSchema, {
        ...baseOptions,
        current:
          currentValue !== undefined 
            ? (schema as BooleanEnvVarSchema).process(currentValue)
            : undefined,
      });
    case "number":
      return new EnvNumberPrompt(schema as NumberEnvVarSchema, {
        ...baseOptions,
        current:
          currentValue !== undefined 
            ? (schema as NumberEnvVarSchema).process(currentValue)
            : undefined,
      });
    case "enum":
      return new EnvEnumPrompt(schema as EnumEnvVarSchema, {
        ...baseOptions,
        current: currentValue,
      });
    default:
      return new EnvStringPrompt(schema as StringEnvVarSchema, {
        ...baseOptions,
        current: currentValue,
      });
  }
}
