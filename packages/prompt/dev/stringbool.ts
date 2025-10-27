import { z } from "zod";
import { prompt } from "../src";

await prompt({
  schemas: {
    B: z.stringbool(),
  },
});
