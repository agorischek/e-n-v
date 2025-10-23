import { EnvPrompt } from "../EnvPrompt";
import type { EnvPromptOptions } from "../options/EnvPromptOptions";
import { S_RADIO_ACTIVE, S_RADIO_INACTIVE } from "../../visuals/symbols";
import type { Key } from "node:readline";
import type { PromptAction } from "../../types/PromptAction";
import type { EnumEnvVarSchema } from "@envcredible/core";
import { padActiveRender } from "../utils/padActiveRender";

export class EnvEnumPrompt<T extends string = string> extends EnvPrompt<T, EnumEnvVarSchema<T>> {
  cursor = 0;
  protected options: EnvPromptOptions<T>;
  private readonly values: readonly T[];

  constructor(schema: EnumEnvVarSchema<T>, opts: EnvPromptOptions<T>) {
    const customValidate = opts.validate;
    
    super(schema, {
      ...opts,
      render: padActiveRender(function (this: EnvEnumPrompt<T>) {
        if (this.state === "submit") {
          const outcomeResult = this.renderOutcomeResult();
          if (outcomeResult) {
            return outcomeResult;
          }

          return `${this.getSymbol()}  ${this.colors.bold(
            this.colors.white(this.key),
          )}${this.colors.subtle("=")}${this.colors.white(
            this.truncateValue(this.value ?? ""),
          )}`;
        }

        if (this.state === "cancel") {
          return this.renderCancelled();
        }

        let output = "";

        // Add header line with symbol based on state and key in bold white and description in gray if provided
        output += `${this.getSymbol()}  ${this.colors.bold(
          this.colors.white(this.key),
        )}`;
        if (this.spec.description) {
          output += ` ${this.colors.subtle(this.spec.description)}`;
        }
        output += "\n";

        // Display enum options
        const dimInputs = this.shouldDimInputs();
        this.values.forEach((option, index) => {
          const isSelected = index === this.cursor;
          const circle = dimInputs
            ? this.colors.dim(isSelected ? S_RADIO_ACTIVE : S_RADIO_INACTIVE)
            : isSelected
              ? this.theme.primary(S_RADIO_ACTIVE)
              : this.colors.dim(S_RADIO_INACTIVE);

          // Determine if this option matches current or default
          let annotation = "";
          let displayValue: string = option;
          
          if (this.current === option && this.default === option) {
            if (this.existingValidationError) {
              annotation = " (current, default, invalid)";
              displayValue = this.colors.strikethrough(option);
            } else {
              annotation = " (current, default)";
            }
          } else if (this.current === option) {
            if (this.existingValidationError) {
              annotation = " (current, invalid)";
              displayValue = this.colors.strikethrough(option);
            } else {
              annotation = " (current)";
            }
          } else if (this.default === option) {
            annotation = " (default)";
          }

          const text = dimInputs
            ? this.colors.dim(displayValue)
            : isSelected
              ? this.colors.white(displayValue)
              : this.colors.subtle(displayValue);
          let suffix = "";
          if (annotation) {
            suffix = dimInputs
              ? this.colors.dim(annotation)
              : isSelected
                ? this.colors.subtle(annotation)
                : "";
          }
          output += `${this.getBar()}  ${circle} ${text}${suffix}\n`;
        });

        // Add validation output with L-shaped pipe
        output += `${this.getBarEnd()}  ${this.renderFooter()}`;

        return output;
      }),
      validate: (value: T | undefined) => {
        if (this.getOutcome() !== "commit") {
          return undefined;
        }

        // Block submission if selecting an invalid current value
        if (this.current !== undefined && this.existingValidationError) {
          const isSelectingInvalidCurrent = this.values[this.cursor] === this.current;
          
          if (isSelectingInvalidCurrent) {
            return this.existingValidationError;
          }
        }

        // Call custom validation if provided
        if (customValidate) {
          const customValidation = customValidate(value);
          if (customValidation) {
            return customValidation;
          }
        }

        return undefined;
      },
    });

    this.options = opts;
    this.values = [...schema.values];

    // Set initial value to current, or default, or first option
    this.setCommittedValue(this.current ?? this.default ?? this.values[0]);

    // Set initial cursor position based on priority: current (if valid) → default → first option
    // Never default focus to an invalid current value
    let initialIndex: number;
    if (this.current !== undefined && !this.existingValidationError) {
      initialIndex = this.values.indexOf(this.current);
    } else if (this.default !== undefined) {
      initialIndex = this.values.indexOf(this.default);
    } else {
      initialIndex = 0;
    }
    this.cursor = Math.max(0, initialIndex);

    this.on("cursor", (action?: PromptAction) => {
      // Clear error state when user navigates (like base Prompt class does)
      if (this.state === "error") {
        this.state = "active";
        this.error = "";
      }

      if (this.isOptionPickerOpen()) {
        return;
      }

      switch (action) {
        case "up":
          this.cursor =
            this.cursor === 0 ? this.values.length - 1 : this.cursor - 1;
          break;
        case "down":
          this.cursor =
            this.cursor === this.values.length - 1 ? 0 : this.cursor + 1;
          break;
      }
      this.updateValue();
    });

    this.on("key", (char: string | undefined, info: Key) => {
      if (!info) return; // Guard against undefined info

      // Clear error state when user types (like base Prompt class does)
      if (this.state === "error") {
        this.state = "active";
        this.error = "";
      }

      if (this.handleFooterKey(char, info)) {
        return;
      }

      if (this.isOptionPickerOpen()) {
        return;
      }
    });
  }

  private updateValue() {
    this.setCommittedValue(this.values[this.cursor]);
  }
}
