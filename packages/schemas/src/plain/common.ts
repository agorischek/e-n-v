import { NumberEnvVarSchema, BooleanEnvVarSchema, type NumberEnvVarSchemaInput, type BooleanEnvVarSchemaInput } from "@e-n-v/core";
import { number, integer, between, boolean } from "@e-n-v/core";
import {
  constraints,
  defaults,
  descriptions,
  traits,
} from "../shared/apiService";

export const port = (input: Partial<NumberEnvVarSchemaInput> = {}) =>
  new NumberEnvVarSchema({
    description: descriptions.port,
    default: defaults.port,
    process: number(
      integer(traits.portInt),
      between(constraints.portMin, constraints.portMax)
    ),
    ...input,
  });

export const PORT = port();

export const debug = (input: Partial<BooleanEnvVarSchemaInput> = {}) =>
  new BooleanEnvVarSchema({
    description: "Enable debug mode",
    default: false,
    process: boolean(),
    ...input,
  });

export const DEBUG = debug();
