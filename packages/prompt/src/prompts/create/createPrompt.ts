import { booleanPreprocessor } from "@e-n-v/core";
import { EnvBooleanPrompt } from "../typed/EnvBooleanPrompt";
import { EnvEnumPrompt } from "../typed/EnvEnumPrompt";
import { EnvNumberPrompt } from "../typed/EnvNumberPrompt";
import { EnvStringPrompt } from "../typed/EnvStringPrompt";
import type { CreatePromptOptions } from "./CreatePromptOptions";

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
      const booleanOverride = preprocessors?.boolean;
      let booleanPreprocess:
        | boolean
        | ReturnType<typeof booleanPreprocessor>
        | undefined;

      if (booleanOverride === undefined) {
        booleanPreprocess = undefined;
      } else if (booleanOverride === true) {
        booleanPreprocess = booleanPreprocessor();
      } else if (booleanOverride === false) {
        booleanPreprocess = false;
      } else if (typeof booleanOverride === "function") {
        booleanPreprocess = booleanOverride;
      } else {
        booleanPreprocess = booleanPreprocessor(booleanOverride);
      }

      return new EnvBooleanPrompt(schema, {
        ...baseOptions,
        current: currentValue,
        preprocess: booleanPreprocess,
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
