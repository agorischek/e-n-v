import type { EnvChannel } from "../../EnvChannel";

/**
 * Channel that reads from and writes to process.env
 * This DOES mutate process.env - use with caution
 */
export class ProcessEnvChannel implements EnvChannel {
  private process: NodeJS.Process;

  /**
   * Create a new ProcessEnvChannel
   * @param processObj - The process object to use (defaults to global process)
   */
  constructor(processObj?: NodeJS.Process) {
    this.process = processObj ?? process;
  }

  /**
   * Get environment variables from process.env
   * @returns Promise that resolves to object containing all environment variable key-value pairs
   */
  async get(): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(this.process.env)) {
      if (value !== undefined) {
        result[key] = value;
      }
    }
    
    return result;
  }

  /**
   * Set environment variables in process.env
   * WARNING: This mutates process.env
   * @param values - Object containing key-value pairs to set
   * @returns Promise that resolves when the values have been set
   */
  async set(values: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(values)) {
      this.process.env[key] = value;
    }
  }
}
