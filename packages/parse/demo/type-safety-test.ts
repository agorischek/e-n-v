import { parse, s } from "../src/index";
import { define } from "@e-n-v/env";

const env = parse(
  {
    PORT: "3000",
    DEBUG: "true",
    NODE_ENV: "development",
  },
  define({
    schemas: {
      PORT: s.number({ default: 3000 }),
      DEBUG: s.boolean({ default: false }),
  NODE_ENV: s.enum({ values: ["development", "production", "test"] as const }),
    },
  })
);

// These should work fine with proper type inference:
const port: number = env.PORT;
const debug: boolean = env.DEBUG;
const nodeEnv: "development" | "production" | "test" = env.NODE_ENV;

// These should cause TypeScript compilation errors (uncomment to test):
// const wrongType: string = env.PORT; // Should error: number is not assignable to string
// const wrongEnum: "invalid" = env.NODE_ENV; // Should error: union type doesn't include "invalid"
// const nonExistent = env.DOES_NOT_EXIST; // Should error: property doesn't exist

console.log("✅ Type inference working correctly!");
console.log(`PORT: ${port}, DEBUG: ${debug}, NODE_ENV: ${nodeEnv}`);