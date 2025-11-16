import type { Processor } from "../../processing/Processor";
import { EnvVarSchemaBase } from "../EnvVarSchemaBase";
import type { EnvVarSchemaInput } from "../EnvVarSchemaInput";

interface ArrayEnvVarSchemaOptions<T> extends EnvVarSchemaInput<T[]> {
  delimiter?: string;
  elementProcessor: Processor<T>;
}

export class ArrayEnvVarSchema<T> extends EnvVarSchemaBase<T[]> {
  public readonly type = "array" as const;
  public readonly delimiter: string;

  constructor(options: ArrayEnvVarSchemaOptions<T>) {
    const { delimiter = ",", elementProcessor, ...input } = options;

    const arrayProcessor: Processor<T[]> = (
      rawValue: string,
    ): T[] | undefined => {
      if (typeof rawValue !== "string") {
        throw new Error("Value must be a string");
      }

      const trimmedValue = rawValue.trim();
      if (trimmedValue === "") {
        return undefined;
      }

      const segments = trimmedValue
        .split(delimiter)
        .map((segment) => segment.trim())
        .filter((segment) => segment.length > 0);

      if (segments.length === 0) {
        return undefined;
      }

      const processedValues: T[] = [];

      for (const segment of segments) {
        const processed = elementProcessor(segment);

        if (processed !== undefined) {
          processedValues.push(processed);
        }
      }

      return processedValues.length > 0 ? processedValues : undefined;
    };

    super({
      ...input,
      process: arrayProcessor,
    });

    this.delimiter = delimiter;
  }
}
