import type { DotEnvXInstance } from "./DotEnvXInstance";
import type { DotEnvXGetOptions } from "./DotEnvXGetOptions";
import type { DotEnvXSetOptions } from "./DotEnvXSetOptions";

/**
 * DotEnvX channel configuration
 */
export interface DotEnvXChannelConfig {
  dotenvx: DotEnvXInstance;
  get?: DotEnvXGetOptions & { [key: string]: unknown };
  set?: DotEnvXSetOptions & { [key: string]: unknown };
}
