import { ask } from "../src";
import { schema as s } from "@envcredible/core";

await ask({
  DEMO: s.string({
    default: "hello",
    required: true,
    description: "Demo variable",
  }),
  DEMO2: s.enum({
    default: "hello",
    values: ["hello", "world"],
  }),
});
