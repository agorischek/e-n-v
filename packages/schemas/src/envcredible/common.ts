import {
  NumberEnvVarSchema,
  type NumberEnvVarSchemaInput,
} from "@e-n-v/core";
import { createZodProcessor } from "../helpers/createZodProcesor";
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
    process: createZodProcessor(
      z.coerce
        .number()
        .int({ message: messages.portInt })
        .min(constraints.portMin, { message: messages.portMin })
        .max(constraints.portMax, { message: messages.portMax }),
    ),
    ...input,
  });

export const PORT = port();
