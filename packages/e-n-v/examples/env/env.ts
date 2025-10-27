import spec from "./env.model.js";
import { parse } from "e-n-v";

// Parse and validate environment variables
export const env = parse({
  source: process.env as Record<string, string>,
  spec,
});
