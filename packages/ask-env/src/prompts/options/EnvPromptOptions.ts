import type { Theme } from "../../visuals/Theme";
import type { PreprocessorOptions } from "@envcredible/core";
import { Readable, Writable } from "node:stream";

export interface EnvPromptOptions<T> {
  key: string;
  current?: T;
  theme?: Theme;
  maxDisplayLength?: number;
  secret?: boolean;
  mask?: string;
  secretToggleShortcut?: string;
  previousEnabled?: boolean;
  input?: Readable;
  output?: Writable;
  validate?: (value: T | undefined) => string | Error | undefined;
  preprocessorOptions?: PreprocessorOptions;
  /**
   * @internal Captures the caller-provided validate callback before prompt-specific wrapping.
   */
  originalValidate?: (value: T | undefined) => string | Error | undefined;
}
