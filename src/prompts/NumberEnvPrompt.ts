import { EnvPrompt } from "./EnvPrompt";
import { EnvPromptOptions } from "../EnvPromptOptions";

interface NumberEnvPromptOptions extends EnvPromptOptions<number> {}

export class NumberEnvPrompt extends EnvPrompt<number> {
  constructor(opts: NumberEnvPromptOptions) {
    super(opts);
  }

  protected formatValue(value: number | undefined): string {
    return value?.toString() ?? "";
  }

  protected parseInput(input: string): number | undefined {
    const trimmed = input.trim();
    if (!trimmed) return undefined;
    
    const parsed = Number(trimmed);
    return isNaN(parsed) ? undefined : parsed;
  }

  protected validateInput(input: string): string | undefined {
    const trimmed = input.trim();
    if (!trimmed) return undefined;
    
    const parsed = Number(trimmed);
    if (isNaN(parsed)) {
      return "Please enter a valid number";
    }
    
    return undefined;
  }

  protected getDefaultValue(): number {
    return 0;
  }
}