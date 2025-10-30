import type { Preprocessor } from "../../types/Preprocessor";

  /**
   * Create a string preprocessor - pass through unchanged
   */
export const  string = (): Preprocessor<string> => (value) => value;
