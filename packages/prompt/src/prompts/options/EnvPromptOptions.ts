import type { Theme } from "../../visuals/Theme";
import type { Preprocessor } from "@e-n-v/core";
import { Readable, Writable } from "node:stream";

export interface EnvPromptOptions<T> {
  /** The environment variable key/name to prompt for */
  key: string;

  /**
   * Raw value from the environment source (e.g., .env) before any preprocessing or validation.
   * Represented as the literal string that was read, if one exists.
   */
  current?: string;

  /** Whether to pad active renders with a trailing newline (default: true) */
  pad?: boolean;

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

  /**
   * Custom preprocessing function to transform values before schema validation.
   * Set to null to disable preprocessing for this prompt.
   */
  preprocess?: Preprocessor<T> | null;
}
