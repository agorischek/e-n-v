import { z } from "zod";
import { ask } from "../src/ask";

const schemas = {
  VERY_LONG_STRING: z.string().default("This is a very long default string that should definitely be truncated when displayed because it exceeds 40 characters"),
  SHORT_STRING: z.string().default("short"),
  LONG_NUMBER: z.number().default(Number("123456789012345678901234567890")),
};

console.log("Testing truncation with default 40 characters:");
await ask(schemas, {
  path: ".env.test-truncation"
});

console.log("\nTesting with custom 20 character limit:");
await ask(schemas, {
  path: ".env.test-truncation-20",
  truncate: 20
});