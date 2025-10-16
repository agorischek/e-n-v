import { ask, NODE_ENV, PORT, OPENAI_API_KEY, defaults } from "../src";

await ask({ NODE_ENV, PORT, OPENAI_API_KEY }, {
    secrets: [...defaults.SECRET_PATTERNS]
});
