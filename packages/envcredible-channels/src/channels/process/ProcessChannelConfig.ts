/**
 * Configuration for the process.env channel
 */
export interface ProcessChannelConfig {
  /**
   * Channel name identifier (optional when using shorthand { process })
   */
  name?: "process";

  /**
   * The process object to use (defaults to global process)
   * Useful for testing or custom process objects
   * Can be used as shorthand: { process } instead of { name: "process" }
   */
  process?: NodeJS.Process;
}
