// app.ts - Use validated environment variables in your application

import spec from "./env.spec.js";
import { parse } from "e-n-v";

// Parse and validate environment variables
export const env = parse({
  source: process.env as Record<string, string>,
  spec,
});

// Use validated, type-safe env vars
console.log(`Starting server on port ${env.PORT}`);
console.log(`Environment: ${env.NODE_ENV}`);
console.log(`Database: ${env.DATABASE_URL}`);

if (env.DEBUG) {
  console.log("Debug mode enabled");
}
