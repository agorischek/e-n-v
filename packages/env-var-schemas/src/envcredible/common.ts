import { NumberEnvVarSchema, type NumberEnvVarSchemaInput } from "../../../envcredible-core/src";
import { processWithZodSchema } from "@envcredible/converters";
import { z } from "zod";
import {
  constraints,
  defaults,
  descriptions,
  messages,
} from "../shared/apiService";

export const port = (input: Partial<NumberEnvVarSchemaInput> = {}) =>
  new NumberEnvVarSchema({
    description: descriptions.port,
    default: defaults.port,
    process: processWithZodSchema<number>(
      z.coerce.number()
        .int({ message: messages.portInt })
        .min(constraints.portMin, { message: messages.portMin })
        .max(constraints.portMax, { message: messages.portMax }),
      "number"
    ),
    ...input,
  });

export const PORT = port();