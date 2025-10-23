import { ask } from "../src";
import { schema } from "@envcredible/core";

const DEMO = schema.string({
  description: "Demo variable",
  required: true,
  default: "hello",
});

await ask({
  DEMO
});
