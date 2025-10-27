import type { EnvVarSchema, Preprocessors } from "@envcredible/core";
import type { Theme } from "../../visuals/Theme";
import { Readable, Writable } from "node:stream";

export interface CreatePromptOptions {
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
  preprocessors?: Preprocessors;
}
