import { parse, s } from "../src/index";
import { define } from "@e-n-v/env";

// Test the type inference
const env = parse(
  {
    PORT: "3000",
    DATABASE_URL: "postgres://localhost:5432/mydb",
    DEBUG: "true",
    MAX_CONNECTIONS: "50",
    API_KEY: "secret-key-123",
    NODE_ENV: "development",
  },
  define({
    schemas: {
      PORT: s.number({ default: 3000 }),
      DATABASE_URL: s.string(),
      DEBUG: s.boolean({ default: false }),
      MAX_CONNECTIONS: s.number(),
      API_KEY: s.string(),
  NODE_ENV: s.enum({ values: ["development", "production", "test"] as const }),
      OPTIONAL_VAR: s.string({ required: false, default: "fallback" }),
    },
  })
);

// These should all be properly typed now:
console.log("Type inference test:");

// PORT should be number
const port: number = env.PORT;
console.log(`PORT is number: ${typeof port === 'number'}`);

// DATABASE_URL should be string  
const dbUrl: string = env.DATABASE_URL;
console.log(`DATABASE_URL is string: ${typeof dbUrl === 'string'}`);

// DEBUG should be boolean
const debug: boolean = env.DEBUG;
console.log(`DEBUG is boolean: ${typeof debug === 'boolean'}`);

// NODE_ENV should be union type "development" | "production" | "test"
const nodeEnv: "development" | "production" | "test" = env.NODE_ENV;
console.log(`NODE_ENV is correct type: ${nodeEnv}`);

// OPTIONAL_VAR should be string | undefined
const optionalVar: string | undefined = env.OPTIONAL_VAR;
console.log(`OPTIONAL_VAR is string|undefined: ${typeof optionalVar}`);

// This should cause TypeScript errors if we try to access non-existent properties:
// console.log(env.NONEXISTENT_PROPERTY); // Should be TS error

console.log("✅ All type checks passed!");