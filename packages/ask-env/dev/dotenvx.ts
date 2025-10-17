import { ask } from "../src/ask";
import { APPLICATIONINSIGHTS_CONNECTION_STRING } from "../../env-var-schemas/src";
import dotenvx from "@dotenvx/dotenvx";
import { OPENAI_API_KEY } from "../dist";

await ask(
  { OPENAI_API_KEY },
  { channel: dotenvx }
);
