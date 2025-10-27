import { prompt } from "../src";
import { OPENAI_API_KEY } from "@e-n-v/schemas";
import dotenvx from "@dotenvx/dotenvx";

await prompt({ schemas: { OPENAI_API_KEY }, channel: { dotenvx } });
