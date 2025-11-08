import type { EnvVarSchema } from "@e-n-v/core";
import {
  isSecretKey as coreIsSecretKey,
  shouldTreatAsSecret,
} from "@e-n-v/models";
import { SECRET_MASK } from "../visuals/symbols";

export const isSecretKey = coreIsSecretKey;

export function maskSecretValue(
  value: string,
  maskChar: string = SECRET_MASK,
): string {
  if (!value) {
    return value;
  }

  return value.replace(/./g, maskChar);
}

export function resolveShouldMask(
  key: string,
  schema: EnvVarSchema,
  patterns: ReadonlyArray<string | RegExp>,
): boolean {
  return shouldTreatAsSecret(key, schema, patterns);
}
