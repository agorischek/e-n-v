import { ask } from "../src";
import type { EnvVarSpec } from "../src/specification/EnvVarSchema";

const schemas = {
    DEMO: {
        type: "string",
        description: "Demo variable",
        required: true,
        default: "hello",
    },
} satisfies Record<string, EnvVarSpec>;

await ask(schemas);