import model from "./env.model.js";
import { parse } from "@e-n-v/env";

// Test the types
const result = parse(process.env, model);
console.log("NODE_ENV type:", typeof result.NODE_ENV);
console.log("DEBUG type:", typeof result.DEBUG);

// Test destructuring
const { NODE_ENV, DEBUG } = result;
console.log("Destructured DEBUG type:", typeof DEBUG);
