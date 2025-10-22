import { ask } from "../src";
import { StringEnvVarSchema } from "@envcredible/types";

// Create a string processor with validation
const stringProcessor = (value: string) => {
  if (value?.length && value.length < 3) {
    throw new Error("Must be at least 3 characters");
  }
  return value;
};

const demoSchema = new StringEnvVarSchema({
  process: stringProcessor,
  description: "Demo variable",
  required: true,
  default: "hello",
});

await ask({
  DEMO: demoSchema,
});
