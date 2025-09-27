import { z } from "zod";
import { askEnv } from "../src/askEnv";

const schemas = {
  DEMO_LONG_VALUE: z.string().optional(),
  DEMO_SHORT_VALUE: z.string().optional(),
};

console.log("Demo of value truncation feature:");
console.log("Enter a very long string for DEMO_LONG_VALUE to see truncation in action");
console.log("The default limit is 40 characters");
console.log();

await askEnv(schemas, {
  path: ".env.demo-truncation"
});