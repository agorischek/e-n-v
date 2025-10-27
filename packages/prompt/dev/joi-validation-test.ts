import Joi from "joi";
import { resolveSchema } from "@e-n-v/converters";

console.log("🧪 Testing Joi Validation\n");

// Test port validation
const portSchema = Joi.number().integer().min(1024).max(65535).default(3000);
const portEnvSchema = resolveSchema(portSchema);

console.log("Testing PORT validation:");
console.log(`Port schema type: ${portEnvSchema.type}`);
console.log(`Port schema required: ${portEnvSchema.required}`);
console.log(`Port schema default: ${portEnvSchema.default}`);

// Test valid values
console.log("\nTesting valid values:");
try {
  const result3000 = portEnvSchema.process("3000");
  console.log(`✅ "3000" -> ${result3000}`);
} catch (error) {
  console.log(`❌ "3000" failed: ${error}`);
}

try {
  const result8080 = portEnvSchema.process("8080");
  console.log(`✅ "8080" -> ${result8080}`);
} catch (error) {
  console.log(`❌ "8080" failed: ${error}`);
}

// Test invalid values
console.log("\nTesting invalid values:");
try {
  const result2 = portEnvSchema.process("2");
  console.log(`❌ "2" unexpectedly succeeded: ${result2}`);
} catch (error) {
  console.log(`✅ "2" correctly failed: ${error}`);
}

try {
  const result80000 = portEnvSchema.process("80000");
  console.log(`❌ "80000" unexpectedly succeeded: ${result80000}`);
} catch (error) {
  console.log(`✅ "80000" correctly failed: ${error}`);
}

try {
  const resultFloat = portEnvSchema.process("3000.5");
  console.log(`❌ "3000.5" unexpectedly succeeded: ${resultFloat}`);
} catch (error) {
  console.log(`✅ "3000.5" correctly failed: ${error}`);
}

try {
  const resultString = portEnvSchema.process("not-a-number");
  console.log(`❌ "not-a-number" unexpectedly succeeded: ${resultString}`);
} catch (error) {
  console.log(`✅ "not-a-number" correctly failed: ${error}`);
}

// Test string validation
console.log("\n" + "=".repeat(50));
console.log("Testing STRING validation:");

const stringSchema = Joi.string().min(3).max(10).required();
const stringEnvSchema = resolveSchema(stringSchema);

try {
  const resultValid = stringEnvSchema.process("hello");
  console.log(`✅ "hello" -> "${resultValid}"`);
} catch (error) {
  console.log(`❌ "hello" failed: ${error}`);
}

try {
  const resultShort = stringEnvSchema.process("hi");
  console.log(`❌ "hi" unexpectedly succeeded: "${resultShort}"`);
} catch (error) {
  console.log(`✅ "hi" correctly failed: ${error}`);
}

try {
  const resultLong = stringEnvSchema.process("this-is-too-long");
  console.log(`❌ "this-is-too-long" unexpectedly succeeded: "${resultLong}"`);
} catch (error) {
  console.log(`✅ "this-is-too-long" correctly failed: ${error}`);
}
