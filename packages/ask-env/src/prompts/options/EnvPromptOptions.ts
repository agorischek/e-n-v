import type { Theme } from "../../visuals/Theme";
import type { PreprocessorOptions } from "@envcredible/core";
import { Readable, Writable } from "node:stream";

export interface EnvPromptOptions<T> {
  key: string;
  current?: T;
  theme?: Theme;
  truncate?: number;
  secret?: boolean;
  mask?: string;
  previousEnabled?: boolean;
  input?: Readable;
  output?: Writable;
  preprocessorOptions?: PreprocessorOptions;
}
