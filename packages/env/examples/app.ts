// app.ts - Use validated environment variables in your application

import { NODE_ENV, DEBUG, PORT, DATABASE_URL } from "./env";

// Use validated, type-safe env vars
console.log(`Starting server on port ${PORT}`);
console.log(`Environment: ${NODE_ENV}`);
console.log(`Database: ${DATABASE_URL}`);

if (DEBUG) {
  console.log("Debug mode enabled");
}
