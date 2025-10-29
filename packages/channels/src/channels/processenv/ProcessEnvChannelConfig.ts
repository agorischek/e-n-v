/**
 * Configuration for ProcessEnv channel using name
 */
export interface ProcessEnvChannelConfig {
  name: "processenv";
}

/**
 * Configuration for ProcessEnv channel using process shorthand
 */
export interface ProcessChannelConfig {
  process: NodeJS.Process;
}
