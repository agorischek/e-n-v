import type { Processor } from "@e-n-v/core";

/**
 * Custom validators for environment variables.
 * These implement the Processor<T> interface and provide composable validation with clear error messages.
 */

// Validator returns error string or null
type Validator<T> = (value: T) => string | null;

// Helper to run validators and aggregate errors
function validate<T>(value: T, validators: Array<Validator<T>>): T {
  const errors = validators
    .map(validator => validator(value))
    .filter((error): error is string => error !== null);
  
  if (errors.length > 0) {
    // Capitalize first letter of first error and join with "and"
    const message = errors.join(" and ");
    throw new Error(message.charAt(0).toUpperCase() + message.slice(1));
  }
  
  return value;
}

// Top-level coercer functions that return Processors
export function string(...validators: Array<Validator<string>>): Processor<string> {
  return (input: string): string | undefined => {
    // Handle empty values per Processor contract
    if (input === "" || input.trim() === "") {
      return undefined;
    }
    
    return validate(input, validators);
  };
}

export function number(...validators: Array<Validator<number>>): Processor<number> {
  return (input: string): number | undefined => {
    // Handle empty values per Processor contract
    const trimmed = input.trim();
    if (trimmed === "") {
      return undefined;
    }
    
    // Coerce to number
    const num = Number(trimmed);
    if (isNaN(num)) {
      throw new Error("Must be a valid number");
    }
    
    return validate(num, validators);
  };
}

export function boolean(): Processor<boolean> {
  return (input: string): boolean | undefined => {
    const trimmed = input.trim();
    if (trimmed === "") {
      return undefined;
    }
    
    const lower = trimmed.toLowerCase();
    if (lower === "true" || lower === "1" || lower === "yes" || lower === "on") {
      return true;
    }
    if (lower === "false" || lower === "0" || lower === "no" || lower === "off") {
      return false;
    }
    
    throw new Error("Must be 'true' or 'false'");
  };
}

// String validators - return error string or null
export function minLength(min: number, requirement?: string): Validator<string> {
  return (value: string) => {
    if (value.length < min) {
      return requirement 
        ? `must be ${requirement}` 
        : `must be at least ${min} characters`;
    }
    return null;
  };
}

export function maxLength(max: number, requirement?: string): Validator<string> {
  return (value: string) => {
    if (value.length > max) {
      return requirement 
        ? `must be ${requirement}` 
        : `must be at most ${max} characters`;
    }
    return null;
  };
}

export function lengthBetween(min: number, max: number, requirement?: string): Validator<string> {
  return (value: string) => {
    if (value.length < min || value.length > max) {
      return requirement 
        ? `must be ${requirement}` 
        : `must be between ${min} and ${max} characters`;
    }
    return null;
  };
}

export function exactLength(length: number, requirement?: string): Validator<string> {
  return (value: string) => {
    if (value.length !== length) {
      return requirement 
        ? `must be ${requirement}` 
        : `must be exactly ${length} characters`;
    }
    return null;
  };
}

export function pattern(regex: RegExp, requirement: string): Validator<string> {
  return (value: string) => {
    if (!regex.test(value)) {
      return `must be ${requirement}`;
    }
    return null;
  };
}

export function url(requirement?: string): Validator<string> {
  return (value: string) => {
    try {
      new URL(value);
      return null;
    } catch {
      return requirement ? `must be ${requirement}` : "must be a valid URL";
    }
  };
}

export function oneOf<T extends string>(values: readonly T[], requirement?: string): Validator<string> {
  return (value: string) => {
    if (!values.includes(value as T)) {
      return requirement 
        ? `must be ${requirement}` 
        : `must be one of: ${values.join(", ")}`;
    }
    return null;
  };
}

// Number validators - return error string or null
export function integer(requirement?: string): Validator<number> {
  return (value: number) => {
    if (!Number.isInteger(value)) {
      return requirement ? `must be ${requirement}` : "must be an integer";
    }
    return null;
  };
}

export function min(minimum: number, requirement?: string): Validator<number> {
  return (value: number) => {
    if (value < minimum) {
      return requirement 
        ? `must be ${requirement}` 
        : `must be at least ${minimum}`;
    }
    return null;
  };
}

export function max(maximum: number, requirement?: string): Validator<number> {
  return (value: number) => {
    if (value > maximum) {
      return requirement 
        ? `must be ${requirement}` 
        : `must be at most ${maximum}`;
    }
    return null;
  };
}

export function between(minimum: number, maximum: number, requirement?: string): Validator<number> {
  return (value: number) => {
    if (value < minimum || value > maximum) {
      return requirement 
        ? `must be ${requirement}` 
        : `must be between ${minimum} and ${maximum}`;
    }
    return null;
  };
}

// Custom validator - requirement is required since we can't infer it
export function custom<T>(
  fn: (value: T) => boolean,
  requirement: string
): Validator<T> {
  return (value: T) => {
    if (!fn(value)) {
      return `must be ${requirement}`;
    }
    return null;
  };
}
