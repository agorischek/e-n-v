import { askEnv } from "../src/askEnv";
import { NODE_ENV, RATE_LIMIT_RPM } from "../../zod-env-var-schemas/src";

await askEnv({ NODE_ENV, RATE_LIMIT_RPM });
