import {
  string,
  number,
  boolean,
  optional,
  defaulted,
  enums,
} from "superstruct";

import { prompt } from "../src";

const schemas = {
  NODE_ENV: enums(["development", "production", "test"] as const),
  PORT: defaulted(number(), 3000),
  DEBUG: defaulted(boolean(), false),
  API_KEY: optional(string()),
};

await prompt({ schemas });
