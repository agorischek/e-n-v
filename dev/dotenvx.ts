import { z } from "zod";
import { askEnv } from "../src/askEnv";
import dotenvx from "@dotenvx/dotenvx";
 

const schemas = {
  DATABASE_URL: z.string().describe("Database connection URL").default("newvalue123"),
};

// Test the askEnv function
await askEnv(schemas, {
  channel: { dotenvx },
}).catch(console.error);
