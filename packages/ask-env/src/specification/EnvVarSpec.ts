
import { type EnvVarType } from "./EnvVarType";

/**
 * Specification for an environment variable.
 */
export class EnvVarSpec {
  /**
   * Create a new environment variable specification.
   * @param type The type of the environment variable (string, number, boolean, enum).
   * @param required Whether the variable is required (default: true).
   * @param nullable Whether the variable can be null (default: false).
   * @param defaultValue The default value for the variable, if any.
   * @param min Minimum value or length (for number or string types).
   * @param max Maximum value or length (for number or string types).
   * @param description Optional description of the variable.
   * @param values Allowed values (for enum types).
   */
  protected constructor(
    public readonly type: EnvVarType,
    public readonly required: boolean = true,
    public readonly nullable: boolean = false,
    public readonly defaultValue?: unknown,
    public readonly min?: number,
    public readonly max?: number,
    public readonly description?: string,
    public readonly values?: string[]
  ) {}
}
