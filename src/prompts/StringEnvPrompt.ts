import { EnvPrompt } from "./EnvPrompt";
import { EnvPromptOptions } from "../EnvPromptOptions";

interface StringEnvPromptOptions extends EnvPromptOptions<string> {}

export class StringEnvPrompt extends EnvPrompt<string> {
  constructor(opts: StringEnvPromptOptions) {
    super(opts);
  }

  protected formatValue(value: string | undefined): string {
    return value ?? "";
  }

  protected parseInput(input: string): string | undefined {
    return input || undefined;
  }

  protected validateInput(input: string): string | undefined {
    // For strings, any non-empty input is valid
    if (!input || !input.trim()) {
      return "Please enter a value";
    }
    return undefined;
  }

  protected getDefaultValue(): string {
    return "";
  }
}
