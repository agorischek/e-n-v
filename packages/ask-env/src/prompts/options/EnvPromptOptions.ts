import type { Theme } from "../../visuals/Theme";
import type { PreprocessorOptions } from "@envcredible/core";
import { Readable, Writable } from "node:stream";

export interface EnvPromptOptions<T> {
  key: string;
  current?: string; // Changed to accept raw string
  default?: T;
  theme?: Theme;
  maxDisplayLength?: number;
  secret?: boolean;
  mask?: string;
  secretToggleShortcut?: string;
  previousEnabled?: boolean;
  input?: Readable;
  output?: Writable;
  validate?: (value: T | undefined) => string | Error | undefined;
  preprocessorOptions?: PreprocessorOptions; // Added preprocessor options
}