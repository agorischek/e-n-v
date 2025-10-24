import type { Theme } from "../../visuals/Theme";
import type { PreprocessorOptions } from "@envcredible/core";
import { Readable, Writable } from "node:stream";

export interface EnvPromptOptions<T> {
  /** The environment variable key/name to prompt for */
  key: string;

  /** The current value of the environment variable, if it exists */
  current?: T;

  /** Theme configuration for styling the prompt interface (colors, etc.) */
  theme?: Theme;

  /** Maximum number of characters to display before truncating with "..." (default: 40) */
  truncate?: number;

  /** Whether this variable should be treated as a secret and masked in the UI */
  secret?: boolean;

  /** Zero-based index of the current prompt in a sequence (used for navigation) */
  index?: number;

  /** Total number of prompts in the sequence (used for progress display) */
  total?: number;

  /** Input stream for reading user input (defaults to process.stdin) */
  input?: Readable;

  /** Output stream for displaying the prompt (defaults to process.stdout) */
  output?: Writable;

  /** Custom preprocessing functions to transform values before schema validation */
  preprocess?: PreprocessorOptions;
}
