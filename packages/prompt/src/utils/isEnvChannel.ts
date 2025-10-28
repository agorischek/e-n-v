import type { EnvChannel } from "@e-n-v/core";

/**
 * Type guard to check if a value is an EnvChannel instance
 */
export function isEnvChannel(value: unknown): value is EnvChannel {
  return (
    typeof value === "object" &&
    value !== null &&
    "get" in value &&
    "set" in value &&
    typeof value.get === "function" &&
    typeof value.set === "function"
  );
}