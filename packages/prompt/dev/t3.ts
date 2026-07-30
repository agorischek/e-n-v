import { z } from "zod";
import { prompt } from "../src";

// Example of client-server schema format used by @t3-oss/env-core
// This separates environment variables into client-side (exposed to browser)
// and server-side (only available on the server) schemas

const clientServerSchemas = {
  client: {
    // Client-side environment variables (exposed to browser)
    NEXT_PUBLIC_API_URL: z
      .string()
      .url()
      .describe("Public API URL accessible from the browser"),
    NEXT_PUBLIC_APP_NAME: z
      .string()
      .default("My App")
      .describe("Application name visible to clients"),
  },
  server: {
    // Server-side environment variables (not exposed to browser)
    DATABASE_URL: z
      .string()
      .url()
      .describe("Database connection URL (server-only)"),
    API_SECRET_KEY: z
      .string()
      .min(32)
      .describe("Secret API key for server authentication"),
    PORT: z.number().min(1024).max(65535).default(3000).describe("Server port"),
  },
};

console.log("🧪 Testing client-server schema format (t3-oss/env-core style)\n");
console.log("📦 Using overload 3: prompt(ClientServerSchemas, { format: 'client-server' })\n");

await prompt(clientServerSchemas, {
  format: "client-server",
  path: ".env.t3",
  secrets: ["API_SECRET_KEY", "DATABASE_URL"],
  truncate: 30,
});

console.log("\n✅ Client-server format prompt completed!");
console.log("🎉 The schemas were merged and prompted as usual!");
