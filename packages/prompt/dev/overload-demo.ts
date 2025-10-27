import { z } from "zod";
import { prompt } from "../src";
import { model } from "@e-n-v/models";

const schemas = {
  API_KEY: z.string().describe("Your API key"),
  PORT: z.number().min(1024).max(65535).default(3000),
  DEBUG: z.boolean().default(false),
};

console.log("🧪 Testing prompt function overloads\n");

// Overload 1: Using model instance and interactive options
console.log("📦 Testing overload 1: prompt(model, options)");
const envModel = model({ schemas, preprocess: true });
await prompt(envModel, { 
  path: ".env.overload1",
  secrets: ["API_KEY"],
  truncate: 20
});

console.log("✅ Overload 1 completed\n");

// Overload 2: Using combined options
console.log("📦 Testing overload 2: prompt(options)");
await prompt({
  schemas,
  preprocess: true,
  path: ".env.overload2", 
  secrets: ["API_KEY"],
  truncate: 20
});

console.log("✅ Overload 2 completed\n");
console.log("🎉 Both overloads work correctly!");