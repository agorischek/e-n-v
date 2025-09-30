import type { GetOptions } from "@dotenvx/dotenvx";

/**
 * Get options without envKeysFile since we manage that ourselves
 */
export type DotEnvXGetOptions = Omit<GetOptions, 'envKeysFile'>;