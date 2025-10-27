import { parse, s } from "../src/index";
import { model } from "@e-n-v/env";

console.log("🔍 Parsing environment variables...\n");

const source = {
  PORT: "3000",
  DATABASE_URL: "postgres://localhost:5432/mydb",
  DEBUG: "true",
  MAX_CONNECTIONS: "50",
  API_KEY: "secret-key-123",
  NODE_ENV: "development",
  // OPTIONAL_VAR is not provided, will use default
};

const schemas = {
  PORT: s.number({ default: 3000 }),
  DATABASE_URL: s.string(),
  DEBUG: s.boolean({ default: false }),
  MAX_CONNECTIONS: s.number(),
  API_KEY: s.string(),
  NODE_ENV: s.enum({ values: ["development", "production", "test"] }),
  OPTIONAL_VAR: s.string({ required: false, default: "fallback" }),
};

// Overload 1: Using model instance
console.log("📦 Testing overload 1: parse(source, model)");
const envModel = model({ schemas, preprocess: true });
const env1 = parse(source, envModel);

console.log("✅ Successfully parsed with model:\n");
console.log(`  PORT: ${env1.PORT} (${typeof env1.PORT})`);
console.log(`  DATABASE_URL: ${env1.DATABASE_URL}`);
console.log(`  DEBUG: ${env1.DEBUG} (${typeof env1.DEBUG})`);

// Overload 2: Using options object
console.log("\n📦 Testing overload 2: parse(source, options)");
const env2 = parse(source, { schemas });

console.log("✅ Successfully parsed with options:\n");
console.log(`  PORT: ${env2.PORT} (${typeof env2.PORT})`);
console.log(`  DATABASE_URL: ${env2.DATABASE_URL}`);
console.log(`  DEBUG: ${env2.DEBUG} (${typeof env2.DEBUG})`);

console.log("\n✅ process.env was NOT mutated");
console.log(`  process.env.PORT: ${process.env.PORT}`);
console.log(`  process.env.DEBUG: ${process.env.DEBUG}`);
