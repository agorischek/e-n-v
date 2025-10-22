import { z } from "zod";
import { ask } from "../src/index.js";

// Example demonstrating the new preprocess options in AskEnvOptions

console.log("🚀 Custom Preprocessing Example for ask-env\n");
console.log("This example shows how to use custom preprocessing functions to preprocess");
console.log("environment variable values before they are validated by schemas.\n");

// Define schemas
const schemas = {
  PORT: z.number().describe("Server port number"),
  DEBUG: z.boolean().describe("Enable debug mode"),
  DATABASE_URL: z.string().describe("Database connection string"),
  ENVIRONMENT: z.enum(["dev", "staging", "prod"]).describe("Application environment"),
};

// Custom preprocessing functions
const preprocessorOptions = {
  // Custom string preprocessor for trimming and transforming
  string: (value: string) => {
    console.log(`📝 String preprocessing: "${value}" → "${value.trim()}"`);
    return value.trim();
  },

  // Custom number preprocessor that removes commas from numeric strings
  // Useful for numbers with thousand separators like "1,000" or "10,000"
  number: (value: string) => {
    console.log(`📝 Number preprocessing: "${value}" → "${value.replace(/,/g, '')}"`);
    return value.replace(/,/g, '');
  },

  // Custom boolean preprocessor that recognizes additional formats
  // Supports "on"/"off", "enabled"/"disabled", "active"/"inactive"
  bool: (value: string) => {
    const lower = value.toLowerCase().trim();
    console.log(`📝 Boolean preprocessing: "${value}" → processing...`);
    
    if (lower === "on" || lower === "enabled" || lower === "active") {
      console.log(`   → converted to "true"`);
      return "true";
    }
    if (lower === "off" || lower === "disabled" || lower === "inactive") {
      console.log(`   → converted to "false"`);
      return "false";
    }
    
    console.log(`   → passed through as "${value}"`);
    return value; // Pass through for standard processing
  },

  // Custom enum preprocessor for case normalization
  enum: (value: string) => {
    const normalized = value.toLowerCase().trim();
    console.log(`📝 Enum preprocessing: "${value}" → "${normalized}"`);
    return normalized;
  }
};

// Create a demo .env file to show the preprocessing in action
console.log("Example .env values that would be preprocessed:");
console.log("PORT=8,080              # Comma will be removed before number validation");
console.log("DEBUG=enabled           # Will be converted to 'true' before boolean validation");
console.log("DATABASE_URL=  test  db # Spaces will be trimmed before string validation");
console.log("ENVIRONMENT=PROD        # Will be normalized to 'prod' before enum validation");
console.log("");
console.log("You can also use:");
console.log("PORT=10,000             # Another example with comma");
console.log("DEBUG=off               # Will be converted to 'false'");
console.log("DEBUG=active            # Will be converted to 'true'");
console.log("DEBUG=disabled          # Will be converted to 'false'");
console.log("ENVIRONMENT=Dev         # Will be normalized to 'dev'");
console.log("");

console.log("The preprocessing functions:");
console.log("• Run BEFORE schema validation");
console.log("• Can return the target type (number/boolean) to bypass further processing");
console.log("• Can return a string for standard schema processing");
console.log("• Can be set to null/undefined to skip preprocessing");
console.log("• Don't guarantee type safety - validation still happens");
console.log("• Now support all four schema types: string, number, boolean, enum");
console.log("");

// Note: In a real CLI app, you would call ask() here:
// await ask(schemas, { 
//   path: ".env.example",
//   preprocess: preprocessorOptions 
// });

console.log("To use these preprocessing options, call ask() with:");
console.log(`
await ask(schemas, {
  preprocess: {
    string: (value) => value.trim(),
    number: (value) => value.replace(/,/g, ''),
    bool: (value) => {
      const lower = value.toLowerCase();
      if (lower === 'on' || lower === 'enabled') return 'true';
      if (lower === 'off' || lower === 'disabled') return 'false';
      return value;
    },
    enum: (value) => value.toLowerCase().trim()
  }
});
`);

console.log("🎉 Custom preprocessing provides flexible preprocessing for all environment variable types!");