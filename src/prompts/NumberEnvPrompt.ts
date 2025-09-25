import { EnvPrompt } from "./EnvPrompt";
import { EnvPromptOptions } from "../EnvPromptOptions";

interface NumberEnvPromptOptions extends EnvPromptOptions<number> {}

export class NumberEnvPrompt extends EnvPrompt<number> {
  constructor(opts: NumberEnvPromptOptions) {
    super(opts);
  }

  protected formatValue(value: number | undefined): string {
    return value !== undefined ? value.toString() : "";
  }

  protected parseInput(input: string): number | undefined {
    if (!input || !input.trim()) {
      return undefined;
    }
    
    const parsed = Number(input.trim());
    if (isNaN(parsed)) {
      return undefined;
    }
    
    return parsed;
  }

  protected validateInput(input: string): string | undefined {
    if (!input || !input.trim()) {
      return "Please enter a number";
    }
    
    const parsed = Number(input.trim());
    if (isNaN(parsed)) {
      return "Please enter a valid number";
    }
    
    return undefined;
  }

  protected getDefaultValue(): number {
    return 0;
  }
}