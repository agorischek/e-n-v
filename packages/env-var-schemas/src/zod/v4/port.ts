import { z } from "zod";
import {
  defaults,
  descriptions,
  constraints,
  messages,
} from "../../shared/apiService";

export const port = () =>
  z
    .coerce.number()
    .describe(descriptions.port)
    .int({ error: messages.portInt })
    .min(constraints.portMin, { error: messages.portMin })
    .max(constraints.portMax, { error: messages.portMax })
    .default(defaults.port);

export const PORT = port();
