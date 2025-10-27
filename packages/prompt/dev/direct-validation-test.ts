import Joi from "joi";
import { resolveSchema } from "@e-n-v/converters";

console.log("🔍 Direct Schema Validation Test\n");

// Test the schema conversion and validation directly
const portSchema = Joi.number().integer().min(1024).max(65535);
const envSchema = resolveSchema(portSchema);

console.log("Testing schema validation directly:");

// Test valid value
try {
  const result = envSchema.process("3000");
  console.log(`✅ "3000" -> ${result}`);
} catch (error) {
  console.log(`❌ "3000" failed: ${error}`);
}

// Test invalid value (too low)
try {
  const result = envSchema.process("2");
  console.log(`❌ "2" unexpectedly succeeded: ${result}`);
} catch (error) {
  console.log(`✅ "2" correctly failed: ${error}`);
}

// Test invalid value (too high)
try {
  const result = envSchema.process("80000");
  console.log(`❌ "80000" unexpectedly succeeded: ${result}`);
} catch (error) {
  console.log(`✅ "80000" correctly failed: ${error}`);
}
