/**
 * Configuration for the process.env channel
 */
export interface ProcessChannelConfig {
  /**
   * Channel name identifier
   */
  name: "process";

  /**
   * The process object to use (defaults to global process)
   * Useful for testing or custom process objects
   */
  process?: NodeJS.Process;
}
