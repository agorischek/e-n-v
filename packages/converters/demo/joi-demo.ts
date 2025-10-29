import { resolveSchema } from "@e-n-v/models";
import Joi from "joi";

console.log("🔧 Joi Converter Demo\n");

// String schema
const stringSchema = Joi.string()
  .min(3)
  .description("A string with minimum 3 characters");
const stringEnvSchema = resolveSchema(stringSchema);
console.log("String Schema:");
console.log(`- Type: ${stringEnvSchema.type}`);
console.log(`- Required: ${stringEnvSchema.required}`);
console.log(`- Description: ${stringEnvSchema.description}`);
console.log(`- Process "hello": ${stringEnvSchema.process("hello")}`);
console.log();

// Number schema
const numberSchema = Joi.number().min(0).default(42);
const numberEnvSchema = resolveSchema(numberSchema);
console.log("Number Schema:");
console.log(`- Type: ${numberEnvSchema.type}`);
console.log(`- Required: ${numberEnvSchema.required}`);
console.log(`- Default: ${numberEnvSchema.default}`);
console.log(`- Process "123": ${numberEnvSchema.process("123")}`);
console.log();

// Boolean schema
const booleanSchema = Joi.boolean().optional();
const booleanEnvSchema = resolveSchema(booleanSchema);
console.log("Boolean Schema:");
console.log(`- Type: ${booleanEnvSchema.type}`);
console.log(`- Required: ${booleanEnvSchema.required}`);
console.log(`- Process "true": ${booleanEnvSchema.process("true")}`);
console.log(`- Process "false": ${booleanEnvSchema.process("false")}`);
console.log(`- Process "1": ${booleanEnvSchema.process("1")}`);
console.log(`- Process "0": ${booleanEnvSchema.process("0")}`);
console.log();

// Enum schema
const enumSchema = Joi.string()
  .valid("development", "production", "test")
  .description("Environment mode");
const enumEnvSchema = resolveSchema(enumSchema);
console.log("Enum Schema:");
console.log(`- Type: ${enumEnvSchema.type}`);
console.log(`- Required: ${enumEnvSchema.required}`);
console.log(`- Description: ${enumEnvSchema.description}`);
console.log(`- Values: ${(enumEnvSchema as any).values?.join(", ")}`);
console.log(`- Process "development": ${enumEnvSchema.process("development")}`);
console.log();

// Error handling
console.log("Error Handling:");
try {
  numberEnvSchema.process("not-a-number");
} catch (error) {
  console.log(`- Invalid number: ${error}`);
}

try {
  enumEnvSchema.process("invalid-env");
} catch (error) {
  console.log(`- Invalid enum: ${error}`);
}

try {
  booleanEnvSchema.process("maybe");
} catch (error) {
  console.log(`- Invalid boolean: ${error}`);
}
