import type { Preprocessor } from "../../types/Preprocessor";

/**
 * Create a number preprocessor that strips commas and whitespace
 */
export const number = (): Preprocessor<number> => (value) => {
  try {
    const cleaned = value.replace(/,/g, "").trim();
    if (/^-?\d*\.?\d+$/.test(cleaned)) {
      return cleaned;
    }
  } catch {
    // Pass through on any error
  }
  return value;
};
