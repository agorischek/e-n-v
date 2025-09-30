import { isCancel } from "@clack/core";
import type { Key } from "node:readline";
import { EnvPromptOptions, defaultTheme } from "../EnvPromptOptions";
import { SKIP_SYMBOL, S_STEP_ACTIVE, S_BAR, S_BAR_END, S_RADIO_ACTIVE, S_RADIO_INACTIVE } from "../symbols";
import { ThemedPrompt } from "../ThemedPrompt";

interface BooleanEnvPromptOptions extends EnvPromptOptions<boolean> {}

export class BooleanEnvPrompt extends ThemedPrompt<boolean> {
  cursor = 0;
  protected options: BooleanEnvPromptOptions;

  constructor(opts: BooleanEnvPromptOptions) {
    super(
      {
        ...opts,
        theme: opts.theme || defaultTheme,
        render: function (this: BooleanEnvPrompt) {
          if (this.state === "submit") {
            // Handle symbol values (like SKIP_SYMBOL) that can't be converted to string
            if (typeof this.value === "symbol") {
              // User skipped - show just the key in gray with hollow diamond
              return `${this.theme.primary(S_STEP_ACTIVE)}  ${this.colors.subtle(this.colors.bold(opts.key))}`;
            }
            // User provided a value - show ENV_KEY=value format with hollow diamond
            return `${this.theme.primary(S_STEP_ACTIVE)}  ${this.colors.bold(this.colors.white(opts.key))}${this.colors.subtle(
              "="
            )}${this.colors.white(this.value ? "true" : "false")}`;
          }

          let output = "";

          // Add header line with symbol based on state and key in bold white and description in gray if provided
          output += `${this.getSymbol()}  ${this.colors.bold(this.colors.white(opts.key))}`;
          if (opts.description) {
            output += ` ${this.colors.subtle(opts.description)}`;
          }
          output += "\n";

          // Create options array
          const options: Array<{ value: boolean; label: string }> = [];
          
          // Add current value if it exists
          if (opts.current !== undefined) {
            if (opts.default !== undefined && opts.current === opts.default) {
              options.push({ value: opts.current, label: "(current, default)" });
            } else {
              options.push({ value: opts.current, label: "(current)" });
            }
          }
          
          // Add default value if it exists and is different from current
          if (opts.default !== undefined && opts.current !== opts.default) {
            options.push({ value: opts.default, label: "(default)" });
          }
          
          // Always add true and false options if not already present
          const hasTrue = options.some(opt => opt.value === true);
          const hasFalse = options.some(opt => opt.value === false);
          
          if (!hasTrue) {
            options.push({ value: true, label: "" });
          }
          if (!hasFalse) {
            options.push({ value: false, label: "" });
          }

          options.forEach((option, index) => {
            const isSelected = index === this.cursor;
            const circle = isSelected ? this.theme.primary(S_RADIO_ACTIVE) : this.colors.dim(S_RADIO_INACTIVE);
            const displayValue = option.value ? "true" : "false";
            const text = isSelected
              ? this.colors.white(displayValue)
              : this.colors.subtle(displayValue);
            const suffix = isSelected && option.label ? this.colors.subtle(` ${option.label}`) : "";
            output += `${this.getBar()}  ${circle} ${text}${suffix}\n`;
          });

          // Add validation output with L-shaped pipe
          if (this.error) {
            output += `${this.getBarEnd()}  ${this.colors.warn(this.error)}`;
          } else {
            output += `${this.getBarEnd()}`;
          }

          return output;
        },
        validate: (value: boolean | symbol) => {
          if (this.options.validate && typeof value !== 'symbol') {
            const customValidation = this.options.validate(value);
            if (customValidation) {
              return customValidation instanceof Error ? customValidation.message : customValidation;
            }
          }
          return undefined;
        },
      },
      false
    );

    this.options = opts;

    this.on("cursor", (action?: "up" | "down" | "left" | "right" | "space" | "enter" | "cancel") => {
      if (!action) return;
      
      switch (action) {
        case "up":
          this.cursor = this.cursor === 0 ? this.getOptionsCount() - 1 : this.cursor - 1;
          break;
        case "down":
          this.cursor = this.cursor === this.getOptionsCount() - 1 ? 0 : this.cursor + 1;
          break;
      }
      this.updateValue();
    });

    this.on("key", (char: string | undefined, info: Key) => {
      if (!info) return;

      // Clear error state when user types
      if (this.state === "error") {
        this.state = "active";
        this.error = "";
      }

      // Handle tab key specifically - return SKIP_SYMBOL immediately
      if (info.name === "tab") {
        this.value = SKIP_SYMBOL as any;
        this.state = "submit";
        return;
      }
    });

    // Initialize the value
    this.updateValue();
  }

  private getOptionsCount(): number {
    let count = 0;
    
    if (this.options.current !== undefined) count++;
    if (this.options.default !== undefined && this.options.current !== this.options.default) count++;
    
    // Always add true and false if not already present
    const hasTrue = (this.options.current === true) || (this.options.default === true);
    const hasFalse = (this.options.current === false) || (this.options.default === false);
    
    if (!hasTrue) count++;
    if (!hasFalse) count++;
    
    return count;
  }

  private updateValue() {
    const options: boolean[] = [];
    
    // Add current value if it exists
    if (this.options.current !== undefined) {
      options.push(this.options.current);
    }
    
    // Add default value if it exists and is different from current
    if (this.options.default !== undefined && this.options.current !== this.options.default) {
      options.push(this.options.default);
    }
    
    // Always add true and false options if not already present
    const hasTrue = options.includes(true);
    const hasFalse = options.includes(false);
    
    if (!hasTrue) options.push(true);
    if (!hasFalse) options.push(false);

    // Set the value based on cursor position
    if (this.cursor < options.length) {
      this.value = options[this.cursor];
    } else {
      this.value = false; // fallback
    }
  }
}
