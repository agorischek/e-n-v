import { parse, s } from "../src/index";
import { define } from "@e-n-v/env";

// Let's test what TypeScript actually infers for individual schemas
type NumberSchema = ReturnType<typeof s.number>;
type StringSchema = ReturnType<typeof s.string>;
type BooleanSchema = ReturnType<typeof s.boolean>;
type EnumSchema = ReturnType<typeof s.enum<"a" | "b">>;

// Let's see what we get for the model call
const testModel = define({
  schemas: {
    PORT: s.number({ default: 3000 }),
    NAME: s.string(),
    DEBUG: s.boolean(),
    ENV: s.enum({ values: ["dev", "prod"] }),
  },
});

type TestModelType = typeof testModel;

const testEnv = parse(
  {
    PORT: "3000",
    NAME: "test",
    DEBUG: "true",
    ENV: "dev",
  },
  testModel,
);

// Let's see what type TypeScript infers for testEnv
type TestEnvType = typeof testEnv;

console.log("Type debugging test completed");
console.log(`PORT: ${testEnv.PORT} (${typeof testEnv.PORT})`);
console.log(`NAME: ${testEnv.NAME} (${typeof testEnv.NAME})`);
console.log(`DEBUG: ${testEnv.DEBUG} (${typeof testEnv.DEBUG})`);
console.log(`ENV: ${testEnv.ENV} (${typeof testEnv.ENV})`);

// Export the types so we can examine them
export type {
  NumberSchema,
  StringSchema,
  BooleanSchema,
  EnumSchema,
  TestModelType,
  TestEnvType,
};
