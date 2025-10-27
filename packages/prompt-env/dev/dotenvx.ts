import { prompt } from "../src";
import { OPENAI_API_KEY } from "../../env-var-schemas/src";
import dotenvx from "@dotenvx/dotenvx";

await prompt({ vars: { OPENAI_API_KEY }, channel: { dotenvx } });
