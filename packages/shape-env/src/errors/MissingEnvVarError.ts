/**
 * Error thrown when a required environment variable is missing
 */
export class MissingEnvVarError extends Error {
  public readonly key: string;

  constructor(key: string) {
    super(`Required environment variable "${key}" is missing`);
    this.name = "MissingEnvVarError";
    this.key = key;
  }
}
