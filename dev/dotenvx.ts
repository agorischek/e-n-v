import { z } from "zod";
import { askEnv } from "../src/askEnv";
import { APPLICATIONINSIGHTS_CONNECTION_STRING } from "../src/schemas/applicationInsights";
import dotenvx from "@dotenvx/dotenvx";

await askEnv(
  {
    APPLICATIONINSIGHTS_CONNECTION_STRING,
  },
  {
    path: ".env.x",
    channel: dotenvx,
  }
);
