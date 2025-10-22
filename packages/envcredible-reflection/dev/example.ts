import { z } from "zod";
import { fromZodSchema } from "../src/index.js";

// Example demonstrating z.stringbool() support in envcredible-reflection

console.log("🧪 Zod v4 stringbool() support in envcredible-reflection\n");

// Create a schema using z.stringbool() - perfect for environment variables
const isDebugSchema = z.stringbool().describe("Enable debug mode");

// Convert to EnvVarSchema
const envVarSchema = fromZodSchema(isDebugSchema);

console.log("✅ Schema type:", envVarSchema.type);
console.log("✅ Schema class:", envVarSchema.constructor.name);
console.log("✅ Description:", envVarSchema.description);
console.log("");

// Test various environment variable values
const testValues = ["true", "false", "1", "0", "yes", "no", "TRUE", "FALSE"];

console.log("Testing environment variable processing:");
for (const value of testValues) {
  try {
    const result = envVarSchema.process(value);
    console.log(`  "${value}" → ${result} (${typeof result})`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`  "${value}" → ERROR: ${message}`);
  }
}

console.log("\n🎉 z.stringbool() is now fully supported for environment variable schemas!");
console.log("   This provides the perfect bridge between string env vars and boolean application logic.");