import { EnvPrompt } from "./EnvPrompt";
import { EnvPromptOptions } from "../EnvPromptOptions";

interface EnumEnvPromptOptions extends EnvPromptOptions<string> {
  options: string[];
}

export class EnumEnvPrompt extends EnvPrompt<string> {
  protected options: EnumEnvPromptOptions;

  constructor(opts: EnumEnvPromptOptions) {
    super(opts);
    this.options = opts;
  }

  protected formatValue(value: string | undefined): string {
    return value ?? "";
  }

  protected parseInput(input: string): string | undefined {
    const trimmed = input.trim();
    if (!trimmed) return undefined;
    return trimmed;
  }

  protected validateInput(input: string): string | undefined {
    const trimmed = input.trim();
    if (!trimmed) return undefined;
    
    // Check if the input is one of the valid enum options
    if (!this.options.options.includes(trimmed)) {
      return `Please enter one of: ${this.options.options.join(", ")}`;
    }
    
    return undefined;
  }

  protected getDefaultValue(): string {
    return this.options.options[0] || "";
  }
}
