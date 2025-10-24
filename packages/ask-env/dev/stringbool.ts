import { z } from "zod";
import { ask } from "../src/ask";

await ask({
  B: z.stringbool(),
});
