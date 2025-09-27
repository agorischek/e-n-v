import { ThemedPrompt } from "./ThemedPrompt";
import { Theme } from "../visuals/Theme";
import { S_STEP_SKIP } from "../visuals/symbols";
import color from "picocolors";

export interface EnvPromptOptions<T> {
  key: string;
  description?: string;
  current?: T;
  default?: T;
  required: boolean;
  validate?: ((value: T | undefined) => string | Error | undefined) | undefined;
  theme?: Theme;
}

export abstract class EnvPrompt<T> extends ThemedPrompt<T> {
  protected key: string;
  protected current?: T;
  protected default?: T;

  constructor(opts: EnvPromptOptions<T> & any, render?: boolean) {
    super(opts, render);
    this.key = opts.key;
    this.current = opts.current;
    this.default = opts.default;
  }

  protected renderSkipped(): string {
    const skipSymbol = this.colors.dim(this.theme.primary(S_STEP_SKIP));
    const keyText = this.colors.subtle(this.colors.bold(this.key));

    return `${skipSymbol}  ${keyText}`;
  }
}
