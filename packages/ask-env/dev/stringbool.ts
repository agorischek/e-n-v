import { z } from "zod";
import { prompt } from "../src";

await prompt({
  vars: {
    B: z.stringbool(),
  },
});
