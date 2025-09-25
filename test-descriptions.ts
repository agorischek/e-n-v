import { z } from "zod";
import { askEnv } from "./src/index";

const schemas = {
  DATABASE_URL: z.string().describe("The PostgreSQL connection string"),
  PORT: z.number().default(3000).describe("The port number for the server"),
  DEBUG: z.boolean().default(false).describe("Enable debug logging"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development").describe("The application environment"),
  API_KEY: z.string(),  // No description - should show no generic text
};

console.log("Testing Zod schema descriptions:");

askEnv(schemas, { envPath: ".env.test" }).catch(console.error);