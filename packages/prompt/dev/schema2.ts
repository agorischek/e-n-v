import { prompt } from "../src";
import { schema as s } from "@e-n-v/core";

await prompt({
  schemas: {
    DEMO: s.string({
      default: "hello",
      required: true,
      description: "Demo variable",
    }),
  },
});
