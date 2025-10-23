import { processValue } from "../src/prompts/processing/processValue";
import { z } from "zod";
import { resolveSchemas } from "@envcredible/converters";

// Test the processing function directly
const vars = {
  DEBUG: z.boolean().describe("Enable debug mode").default(false),
};

const schemas = resolveSchemas(vars);
console.log("🔍 Schemas:", schemas);

// Get the boolean schema by key
const debugSchema = schemas["DEBUG"];
console.log("🔍 DEBUG schema found:", debugSchema);

if (debugSchema && debugSchema.type === "boolean") {
  console.log("\n🧪 Testing processValue with 'maybe':");
  const result = processValue("maybe", debugSchema);
  console.log("Result:", result);
  
  console.log("\n🧪 Testing processValue with 'true':");
  const result2 = processValue("true", debugSchema);
  console.log("Result:", result2);
}