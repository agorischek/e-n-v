import { prompt } from "../src";
import { schema as s } from "@envcredible/core";

await prompt({
  vars: {
    DEMO: s.string({
      default: "hello",
      required: true,
      description: "Demo variable",
    }),
  },
});
