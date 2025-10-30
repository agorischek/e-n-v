import type { Processor } from "@e-n-v/core";

/**
 * Custom validators for environment variables.
 * These implement the Processor<T> interface and provide composable validation with clear error messages.
 */

// Validator returns array of requirement strings (or null if valid)
type Validator<T> = (value: T) => string[] | null;

// Helper to convert array of items to natural language list
function toList(items: string[]): string {
  if (items.length === 0) {
    return "";
  }
  if (items.length === 1) {
    return items[0]!;
  }
  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }
  // 3+ items: use commas and "and" before the last item
  const allButLast = items.slice(0, -1).join(", ");
  return `${allButLast}, and ${items[items.length - 1]}`;
}

// Helper to run validators and aggregate errors
function validate<T>(value: T, validators: Array<Validator<T>>): T {
  const allRequirements = validators
    .map(validator => validator(value))
    .filter((requirements): requirements is string[] => requirements !== null)
    .flat();
  
  if (allRequirements.length > 0) {
    const message = toList(allRequirements);
    throw new Error(`Must be ${message}`);
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

// String validators - return array of requirement strings or null
export function minLength(min: number, requirement?: string): Validator<string> {
  return (value: string) => {
    if (value.length < min) {
      return requirement 
        ? [requirement]
        : [`at least ${min} characters`];
    }
    return null;
  };
}

export function maxLength(max: number, requirement?: string): Validator<string> {
  return (value: string) => {
    if (value.length > max) {
      return requirement 
        ? [requirement]
        : [`at most ${max} characters`];
    }
    return null;
  };
}

export function lengthBetween(min: number, max: number, requirement?: string): Validator<string> {
  return (value: string) => {
    if (value.length < min || value.length > max) {
      return requirement 
        ? [requirement]
        : [`between ${min} and ${max} characters`];
    }
    return null;
  };
}

export function exactLength(length: number, requirement?: string): Validator<string> {
  return (value: string) => {
    if (value.length !== length) {
      return requirement 
        ? [requirement]
        : [`exactly ${length} characters`];
    }
    return null;
  };
}

export function pattern(regex: RegExp, requirement: string | string[]): Validator<string> {
  return (value: string) => {
    if (!regex.test(value)) {
      return Array.isArray(requirement) ? requirement : [requirement];
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
      return requirement ? [requirement] : ["a valid URL"];
    }
  };
}

export function oneOf<T extends string>(values: readonly T[], requirement?: string): Validator<string> {
  return (value: string) => {
    if (!values.includes(value as T)) {
      return requirement 
        ? [requirement]
        : [`one of: ${values.join(", ")}`];
    }
    return null;
  };
}

// Number validators - return array of requirement strings or null
export function integer(requirement?: string): Validator<number> {
  return (value: number) => {
    if (!Number.isInteger(value)) {
      return requirement ? [requirement] : ["an integer"];
    }
    return null;
  };
}

export function min(minimum: number, requirement?: string): Validator<number> {
  return (value: number) => {
    if (value < minimum) {
      return requirement 
        ? [requirement]
        : [`at least ${minimum}`];
    }
    return null;
  };
}

export function max(maximum: number, requirement?: string): Validator<number> {
  return (value: number) => {
    if (value > maximum) {
      return requirement 
        ? [requirement]
        : [`at most ${maximum}`];
    }
    return null;
  };
}

export function between(minimum: number, maximum: number, requirement?: string): Validator<number> {
  return (value: number) => {
    if (value < minimum || value > maximum) {
      return requirement 
        ? [requirement]
        : [`between ${minimum} and ${maximum}`];
    }
    return null;
  };
}

// Custom validator - can return multiple requirements
export function custom<T>(
  fn: (value: T) => boolean,
  ...requirements: string[]
): Validator<T> {
  return (value: T) => {
    if (!fn(value)) {
      return requirements;
    }
    return null;
  };
}
