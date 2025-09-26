import { EnvPrompt } from "./EnvPrompt";
import { EnvPromptOptions } from "../EnvPromptOptions";

interface BooleanEnvPromptOptions extends EnvPromptOptions<boolean> {}

export class BooleanEnvPrompt extends EnvPrompt<boolean> {
  constructor(opts: BooleanEnvPromptOptions) {
    super(opts);
  }

  protected formatValue(value: boolean | undefined): string {
    if (value === undefined) return "";
    return value ? "true" : "false";
  }

  protected parseInput(input: string): boolean | undefined {
    const trimmed = input.trim().toLowerCase();
    if (!trimmed) return undefined;
    
    if (trimmed === "true" || trimmed === "t" || trimmed === "yes" || trimmed === "y" || trimmed === "1") {
      return true;
    }
    if (trimmed === "false" || trimmed === "f" || trimmed === "no" || trimmed === "n" || trimmed === "0") {
      return false;
    }
    
    return undefined;
  }

  protected validateInput(input: string): string | undefined {
    const trimmed = input.trim().toLowerCase();
    if (!trimmed) return undefined;
    
    const validValues = ["true", "false", "t", "f", "yes", "no", "y", "n", "1", "0"];
    if (!validValues.includes(trimmed)) {
      return "Please enter true/false, yes/no, or 1/0";
    }
    
    return undefined;
  }

  protected getDefaultValue(): boolean {
    return false;
  }
}