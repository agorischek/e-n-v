import { ask } from "../src";


await ask({
    DEMO: {
        type: "string",
        description: "Demo variable",
        required: true,
        default: "hello",
    },
});