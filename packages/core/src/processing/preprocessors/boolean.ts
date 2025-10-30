import { FALSE_STRINGS } from "../constants/FALSE_STRINGS";
import { TRUE_STRINGS } from "../constants/TRUE_STRINGS";
import type { BooleanPreprocessorOptions } from "../preprocessors";
import type { Preprocessor } from "../types/Preprocessor";

export const boolean = (
  options: BooleanPreprocessorOptions = {
    true: TRUE_STRINGS,
    false: FALSE_STRINGS,
  }
): Preprocessor<boolean> => {
  const normalize = (candidate: string) => candidate.toLowerCase().trim();
  const trueValues = new Set(options.true.map(normalize));
  const falseValues = new Set(options.false.map(normalize));

  for (const candidate of trueValues) {
    if (falseValues.has(candidate)) {
      throw new Error(
        `Boolean preprocessor option value "${candidate}" cannot map to both true and false`
      );
    }
  }

  return (value) => {
    try {
      const cleaned = normalize(value);

      if (trueValues.has(cleaned)) {
        return true;
      }

      if (falseValues.has(cleaned)) {
        return false;
      }
    } catch {
      // Pass through on any error
    }
    return value;
  };
};
