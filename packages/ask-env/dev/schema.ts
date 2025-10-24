import { ask, s } from "../src";

const DEMO = s.string({
  description: "Demo variable",
  required: true,
  default: "hello",
});

await ask({ DEMO });
