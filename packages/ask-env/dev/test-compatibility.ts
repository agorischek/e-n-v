import { z } from "zod";
import { fromZodSchema } from "@envcredible/schematization";

// Test that the process function is available
const numberSchema = z.coerce.number().min(1, "Must be at least 1").max(100, "Must be at most 100");
const spec = fromZodSchema(numberSchema);

console.log("Process Function Test:");
console.log("Has process function:", !!spec.process);

if (spec.process) {
  console.log("\nProcess function results:");
  console.log('process("50"):', spec.process("50"));
  console.log('process("invalid"):', spec.process("invalid"));
}

// Test that process function handles validation properly with z.coerce
console.log("\nTesting z.coerce behavior:");
if (spec.process) {
  // These should parse but potentially fail validation constraints
  console.log('process("150"):', spec.process("150")); // Will parse to 150 but may not pass z.min/max constraints
  console.log('process("-5"):', spec.process("-5"));   // Will parse to -5 but may not pass z.min constraint
}