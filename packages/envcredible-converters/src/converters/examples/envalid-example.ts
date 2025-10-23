/**
 * Example usage of the Envalid converter with envcredible
 * 
 * This demonstrates how to use existing Envalid validators
 * with the envcredible ecosystem.
 */

import { resolveSchema } from "../../index";

// Mock Envalid validators (in real usage, these would come from the 'envalid' package)
const createEnvalidValidator = <T>(
  parseFn: (input: string) => T,
  options: {
    choices?: readonly T[];
    default?: T;
    devDefault?: T;
    desc?: string;
  } = {}
) => ({
  _parse: parseFn,
  ...options,
});

// Simulated Envalid validators
const str = (options: any = {}) => createEnvalidValidator(
  (input: string) => {
    if (typeof input === "string") return input;
    throw new Error(`Not a string: "${input}"`);
  },
  options
);

const num = (options: any = {}) => createEnvalidValidator(
  (input: string) => {
    const coerced = parseFloat(input);
    if (Number.isNaN(coerced)) throw new Error(`Invalid number input: "${input}"`);
    return coerced;
  },
  options
);

const bool = (options: any = {}) => createEnvalidValidator(
  (input: string | boolean) => {
    switch (input) {
      case true:
      case 'true':
      case 't':
      case 'yes':
      case 'on':
      case '1':
        return true;
      case false:
      case 'false':
      case 'f':
      case 'no':
      case 'off':
      case '0':
        return false;
      default:
        throw new Error(`Invalid bool input: "${input}"`);
    }
  },
  options
);

const email = (options: any = {}) => createEnvalidValidator(
  (input: string) => {
    const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (EMAIL_REGEX.test(input)) return input;
    throw new Error(`Invalid email address: "${input}"`);
  },
  options
);

// Example: Convert Envalid validators to envcredible schemas
function exampleEnvalidConversion() {
  console.log("=== Envalid to Envcredible Conversion Example ===\n");

  // Example 1: Basic string validator
  const apiKeyValidator = str({ desc: "API key for external service" });
  const apiKeySchema = resolveSchema(apiKeyValidator);
  console.log("API Key Schema:", {
    type: apiKeySchema.type,
    required: apiKeySchema.required,
    description: apiKeySchema.description,
  });

  // Example 2: Number with default
  const portValidator = num({ default: 3000, desc: "Server port" });
  const portSchema = resolveSchema(portValidator);
  console.log("Port Schema:", {
    type: portSchema.type,
    required: portSchema.required,
    default: portSchema.default,
    description: portSchema.description,
  });

  // Example 3: Boolean validator
  const debugValidator = bool({ default: false, desc: "Enable debug mode" });
  const debugSchema = resolveSchema(debugValidator);
  console.log("Debug Schema:", {
    type: debugSchema.type,
    required: debugSchema.required,
    default: debugSchema.default,
  });

  // Example 4: Enum validator (using choices)
  const envValidator = str({ 
    choices: ["development", "test", "production"] as const,
    default: "development",
    desc: "Application environment"
  });
  const envSchema = resolveSchema(envValidator);
  console.log("Environment Schema:", {
    type: envSchema.type,
    required: envSchema.required,
    default: envSchema.default,
    values: (envSchema as any).values, // EnumEnvVarSchema specific
  });

  // Example 5: Email validator
  const adminEmailValidator = email({ 
    default: "admin@example.com",
    desc: "Administrator email address"
  });
  const adminEmailSchema = resolveSchema(adminEmailValidator);
  console.log("Admin Email Schema:", {
    type: adminEmailSchema.type,
    required: adminEmailSchema.required,
    default: adminEmailSchema.default,
  });

  console.log("\n=== Testing Value Processing ===\n");

  // Test processing values
  try {
    console.log("Port parsing '8080':", portSchema.process("8080"));
    console.log("Debug parsing 'true':", debugSchema.process("true"));
    console.log("Environment parsing 'production':", envSchema.process("production"));
    console.log("Email parsing 'test@example.com':", adminEmailSchema.process("test@example.com"));
  } catch (error) {
    console.error("Processing error:", error);
  }

  console.log("\n=== Testing devDefault behavior ===\n");

  // Example with devDefault (works in non-production environments)
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "development";

  const dbUrlValidator = str({
    default: "postgres://prod-db/app",
    devDefault: "postgres://localhost:5432/app_dev",
    desc: "Database connection URL"
  });
  const dbUrlSchema = resolveSchema(dbUrlValidator);
  console.log("Database URL Schema (dev mode):", {
    type: dbUrlSchema.type,
    required: dbUrlSchema.required,
    default: dbUrlSchema.default, // Should be devDefault in development
  });

  // Restore original NODE_ENV
  process.env.NODE_ENV = originalEnv;
}

// Run the example
if (import.meta.main) {
  exampleEnvalidConversion();
}