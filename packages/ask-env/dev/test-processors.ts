import { z } from "zod";
import { fromZodSchema } from "@envcredible/schematization";
import { defaultProcessors } from "@envcredible/channels";

// Test number processing with z.coerce
const numberSchema = z.coerce.number().int().min(1).max(100).default(50);
const numberSpec = fromZodSchema(numberSchema);

console.log("Number Schema Processing Test:");
console.log("Type:", numberSpec.type);
console.log("Required:", numberSpec.required);
console.log("Default:", numberSpec.default);
console.log("Has process function:", !!numberSpec.process);

// Test the process function
if (numberSpec.process) {
  console.log("\nTesting process function:");
  console.log('process("42"):', numberSpec.process("42"));
  console.log('process("3.14"):', numberSpec.process("3.14")); // Should be rounded down to 3
  console.log('process("invalid"):', numberSpec.process("invalid")); // Should return undefined
  console.log('process("150"):', numberSpec.process("150")); // Should work through z.coerce but may fail validation
}

// Test boolean processing
const booleanSchema = z.boolean().default(true);
const booleanSpec = fromZodSchema(booleanSchema);

console.log("\nBoolean Schema Processing Test:");
console.log("Type:", booleanSpec.type);
console.log("Has process function:", !!booleanSpec.process);

if (booleanSpec.process) {
  console.log("\nTesting boolean process function:");
  console.log('process("true"):', booleanSpec.process("true"));
  console.log('process("false"):', booleanSpec.process("false"));
  console.log('process("1"):', booleanSpec.process("1"));
  console.log('process("0"):', booleanSpec.process("0"));
  console.log('process("invalid"):', booleanSpec.process("invalid"));
}

// Test enum processing
const enumSchema = z.enum(["dev", "staging", "production"]).default("dev");
const enumSpec = fromZodSchema(enumSchema);

console.log("\nEnum Schema Processing Test:");
console.log("Type:", enumSpec.type);
if (enumSpec.type === "enum") {
  console.log("Values:", enumSpec.values);
}
console.log("Has process function:", !!enumSpec.process);

if (enumSpec.process) {
  console.log("\nTesting enum process function:");
  console.log('process("dev"):', enumSpec.process("dev"));
  console.log('process("production"):', enumSpec.process("production"));
  console.log('process("invalid"):', enumSpec.process("invalid"));
}

// Test default processors directly
console.log("\nDefault Processors Test:");
console.log('defaultProcessors.number()("42.5"):', defaultProcessors.number()("42.5"));
console.log('defaultProcessors.boolean()("yes"):', defaultProcessors.boolean()("yes"));
console.log('defaultProcessors.enum(["a", "b"])("a"):', defaultProcessors.enum(["a", "b"])("a"));