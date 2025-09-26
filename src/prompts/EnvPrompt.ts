import { ThemedPrompt } from "./ThemedPrompt";
import { Theme } from "../visuals/Theme";

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

  constructor(opts: EnvPromptOptions<T> & any, render?: boolean) {
    super(opts, render);
    this.key = opts.key;
  }
}
