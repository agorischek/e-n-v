import { ask, NODE_ENV, OPENAI_API_KEY, PORT } from "../src";

await ask({ NODE_ENV, PORT, OPENAI_API_KEY });
