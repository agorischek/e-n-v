// app.ts - Use your validated environment in your application

import { DATABASE_URL, PORT, NODE_ENV, API_KEY } from "./env";

console.log("🚀 Starting application...");
console.log(`Environment: ${NODE_ENV}`);
console.log(`Port: ${PORT}`);
console.log(`Database: ${DATABASE_URL}`);
console.log(`API Key: ${API_KEY.slice(0, 8)}...`);

// Your application code here
// The environment variables are fully validated and type-safe!
