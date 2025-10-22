import { z } from "zod";
import { ask } from "../src/ask";

import { RABBITMQ_URL } from "../../env-var-schemas/src";

const vars = {
  RABBITMQ_URL,
};

await ask(vars, { path: ".env", root: import.meta.url });