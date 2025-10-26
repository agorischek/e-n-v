import type { EnvChannel } from "@envcredible/channels";
import { resolveChannel } from "@envcredible/channels";
import type { EnvVarSchema, Preprocessors } from "@envcredible/core";
import { resolveSchemas } from "@envcredible/schemata";
import type { EnvMetaOptions } from "./EnvMetaOptions";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

/**
 * Metadata container for environment variable loading configuration
 * Encapsulates channel, path, preprocessors, and schemas
 */
export class EnvMeta {
  /**
   * Channel used to read/write environment variables
   */
  public readonly channel: EnvChannel;

  /**
   * Fully qualified path to the env file
   */
  public readonly path: string;

  /**
   * Preprocessing functions for environment variable types
   */
  public readonly preprocess?: Preprocessors;

  /**
   * Resolved environment variable schemas
   */
  public readonly schemas: Record<string, EnvVarSchema>;

  /**
   * Create an EnvMeta instance from options
   * @param options - Configuration options
   */
  constructor(options: EnvMetaOptions) {
    // Resolve root directory
    const rootDir = this.resolveRootDirectory(options.root);

    // Resolve fully qualified path
    this.path = rootDir ? resolve(rootDir, options.path) : options.path;

    // Resolve schemas
    this.schemas = resolveSchemas(options.vars);

    // Resolve channel
    this.channel = resolveChannel(options.channel, this.path);

    // Preprocessors can be added later if needed
    this.preprocess = undefined;
  }

  /**
   * Resolve root directory from string or URL
   * @param root - Root option (string path, file:// URL, or undefined)
   * @returns Resolved directory path or undefined
   */
  private resolveRootDirectory(root?: string | URL): string | undefined {
    if (!root) {
      return undefined;
    }

    // Handle URL objects or file:// strings
    if (root instanceof URL || (typeof root === "string" && root.startsWith("file://"))) {
      const url = typeof root === "string" ? root : root.href;
      return dirname(fileURLToPath(url));
    }

    // Handle regular string paths
    return root as string;
  }
}
