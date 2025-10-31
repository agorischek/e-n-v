import {
  defaults,
  descriptions,
  constraints,
  messages,
} from "../../shared/apiService";
import type { ZodSingleton } from "./types";

export const port = (z: ZodSingleton) =>
  z.coerce
    .number()
    .describe(descriptions.port)
    .int({ error: messages.portInt })
    .min(constraints.portMin, { error: messages.portMin })
    .max(constraints.portMax, { error: messages.portMax })
    .default(defaults.port);
