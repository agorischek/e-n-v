import { prompt, s } from "../src";

const DEMO = s.string({
  description: "Demo variable",
  required: true,
  default: "hello",
});

await prompt({ schemas: { DEMO } });
