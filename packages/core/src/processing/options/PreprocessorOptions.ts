import type { Preprocessor } from "../types/Preprocessor";
import type { BooleanMap } from "./BooleanMap";

export type PreprocessorOptions = Partial<{
  /**
   * Custom string preprocessing function
   * Receives the string value and should return a string value
   * @param value - The raw string value from the environment variable
   * @returns Preprocessed string value
   */
  string?: Preprocessor<string> | boolean;

  /**
   * Custom number preprocessing function
   * Receives the string value and should return a string or the target number type
   * @param value - The raw string value from the environment variable
   * @returns Preprocessed string or number value
   */
  number?: Preprocessor<number> | boolean;

  /**
   * Custom boolean preprocessing function
   * Receives the string value and should return a string or the target boolean type
   * @param value - The raw string value from the environment variable
   * @returns Preprocessed string or boolean value
   */
  boolean?: boolean | Preprocessor<boolean> | BooleanMap;

  /**
   * Custom enum preprocessing function
   * Receives the string value and should return a string value
   * @param value - The raw string value from the environment variable
   * @returns Preprocessed string value
   */
  enum?: Preprocessor<string> | boolean;
}>;
