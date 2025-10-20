import { ask } from "../src/ask";
import { APPLICATIONINSIGHTS_CONNECTION_STRING } from "../../zod-env-var-schemas/src";
import dotenvx from "@dotenvx/dotenvx";

await ask(
  {
    APPLICATIONINSIGHTS_CONNECTION_STRING,
  },
  {
    path: ".env.x",
    channel: dotenvx,
  },
);
