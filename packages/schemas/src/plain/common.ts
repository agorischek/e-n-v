import { NumberEnvVarSchema, type NumberEnvVarSchemaInput } from "@e-n-v/core";
import { number, integer, between } from "@e-n-v/core";
import {
  constraints,
  defaults,
  descriptions,
  attributes,
} from "../shared/apiService";

export const port = (input: Partial<NumberEnvVarSchemaInput> = {}) =>
  new NumberEnvVarSchema({
    description: descriptions.port,
    default: defaults.port,
    process: number(
      integer(attributes.portInt),
      between(constraints.portMin, constraints.portMax)
    ),
    ...input,
  });

export const PORT = port();
