import { z } from "zod";
import { askEnv } from "../src/askEnv";

const schemas = {
  VERY_LONG_STRING: z.string().default("This is a very long default string that should definitely be truncated when displayed because it exceeds 40 characters"),
  SHORT_STRING: z.string().default("short"),
  LONG_NUMBER: z.number().default(123456789012345678901234567890),
};

console.log("Testing truncation with default 40 characters:");
await askEnv(schemas, {
  path: ".env.test-truncation"
});

console.log("\nTesting with custom 20 character limit:");
await askEnv(schemas, {
  path: ".env.test-truncation-20",
  maxDisplayLength: 20
});