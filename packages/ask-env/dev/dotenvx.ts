import { ask } from "../src/ask";
import { OPENAI_API_KEY } from "../../env-var-schemas/src";
import dotenvx from "@dotenvx/dotenvx";

await ask({ OPENAI_API_KEY }, { channel: { dotenvx } });
