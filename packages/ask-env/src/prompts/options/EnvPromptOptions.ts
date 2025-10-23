import type { Theme } from "../../visuals/Theme";
import type { Preprocessors } from "@envcredible/core";
import { Readable, Writable } from "node:stream";

export interface EnvPromptOptions<T> {
  key: string;
  existing?: string;
  default?: T;
  theme?: Theme;
  truncate?: number;
  secret?: boolean;
  mask?: string;
  secretToggleShortcut?: string;
  previousEnabled?: boolean;
  input?: Readable;
  output?: Writable;
  validate?: (value: T | undefined) => string | Error | undefined;
  preprocessors?: Preprocessors;
}