import { askEnv } from "../src/askEnv";
import { APPLICATIONINSIGHTS_CONNECTION_STRING } from "../../zod-env-var-schemas/src";

await askEnv({ APPLICATIONINSIGHTS_CONNECTION_STRING });
