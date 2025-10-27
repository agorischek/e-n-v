import model from "./env.model.js";
import { parse } from "@e-n-v/env";

// Parse and validate environment variables
export const { NODE_ENV, DEBUG, PORT, DATABASE_URL, API_KEY } = parse(process.env, model);
