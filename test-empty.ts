import { z } from "zod";
import { askEnv } from "./src/index";

// Set some environment variables to test empty string handling
process.env.DATABASE_URL = "postgres://localhost";
process.env.PORT = "";  // Empty string should be treated as undefined
process.env.DEBUG = "true";

const schemas = {
  DATABASE_URL: z.string(),
  PORT: z.number().default(3000),
  DEBUG: z.boolean().default(false),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
};

console.log("Testing empty string handling (PORT is set to empty string):");
console.log("Current env values:");
console.log("- DATABASE_URL:", JSON.stringify(process.env.DATABASE_URL));
console.log("- PORT:", JSON.stringify(process.env.PORT));
console.log("- DEBUG:", JSON.stringify(process.env.DEBUG));
console.log("");

askEnv(schemas, { envPath: ".env.test" }).catch(console.error);