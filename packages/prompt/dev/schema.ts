import { prompt } from "../src";
import { s } from "@e-n-v/core";

const DEMO = s.string({
  description: "Demo variable",
  required: true,
  default: "hello",
});

await prompt({ schemas: { DEMO } });
