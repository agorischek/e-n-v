import type { SetOptions } from "@dotenvx/dotenvx";

/**
 * Set options without envKeysFile since we manage that ourselves
 */
export type DotEnvXSetOptions = Omit<SetOptions, "envKeysFile">;
