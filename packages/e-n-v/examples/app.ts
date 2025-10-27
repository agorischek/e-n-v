// app.ts - Use validated environment variables in your application

import { env } from "./env/env";

// Use validated, type-safe env vars
console.log(`Starting server on port ${env.PORT}`);
console.log(`Environment: ${env.NODE_ENV}`);
console.log(`Database: ${env.DATABASE_URL}`);

if (env.DEBUG) {
  console.log("Debug mode enabled");
}
