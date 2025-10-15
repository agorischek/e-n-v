import { askEnv } from "../src/askEnv";
import { NODE_ENV, OPENAI_API_KEY, PORT, REDIS_URL } from "../../zod-env-var-schemas/src";

await askEnv({ NODE_ENV, PORT, OPENAI_API_KEY, REDIS_URL });
    