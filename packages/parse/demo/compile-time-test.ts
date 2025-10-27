import { parse, s } from "../src/index";
import { define } from "@e-n-v/env";

const envModel = define({
  schemas: {
    PORT: s.number({ default: 3000 }),
    NAME: s.string(),
    DEBUG: s.boolean(),
    ENV: s.enum({ values: ["development", "production"] as const }),
  },
});

const env = parse(
  {
    PORT: "3000",
    NAME: "test",
    DEBUG: "true",
    ENV: "development",
  },
  envModel
);

// These should compile successfully if types are correct
function typeTests() {
  // Test that PORT is number
  const port: number = env.PORT;
  const portMath: number = env.PORT * 2;
  
  // Test that NAME is string
  const name: string = env.NAME;
  const nameUpper: string = env.NAME.toUpperCase();
  
  // Test that DEBUG is boolean
  const debug: boolean = env.DEBUG;
  const debugNot: boolean = !env.DEBUG;
  
  // Test that ENV is union type
  const envType: "development" | "production" = env.ENV;
  
  // These should cause TypeScript errors if uncommented:
  // const wrongPort: string = env.PORT; // Error: number is not assignable to string
  // const wrongName: number = env.NAME; // Error: string is not assignable to number  
  // const wrongDebug: string = env.DEBUG; // Error: boolean is not assignable to string
  // const wrongEnv: "invalid" = env.ENV; // Error: union doesn't include "invalid"
  
  return { port, name, debug, envType, portMath, nameUpper, debugNot };
}

const result = typeTests();
console.log("✅ All type tests passed!");
console.log(result);