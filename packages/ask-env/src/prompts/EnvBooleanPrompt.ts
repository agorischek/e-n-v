import { EnvPrompt } from "./EnvPrompt";
import type { EnvPromptOptions } from "./EnvPrompt";
import { S_RADIO_ACTIVE, S_RADIO_INACTIVE } from "../visuals/symbols";
import type { Key } from "node:readline";
import type { PromptAction } from "./types/PromptAction";
import type { BooleanEnvVarSchema } from "../specification/EnvVarSchema";
import { padActiveRender } from "./utils/padActiveRender";

export class EnvBooleanPrompt extends EnvPrompt<boolean, BooleanEnvVarSchema> {
  cursor: number;

  constructor(schema: BooleanEnvVarSchema, opts: EnvPromptOptions<boolean>) {
    super(
      schema,
      {
        ...opts,
        render: padActiveRender(function (this: EnvBooleanPrompt) {
          if (this.state === "submit") {
            const outcomeResult = this.renderOutcomeResult();
            if (outcomeResult) {
              return outcomeResult;
            }

            const valueStr = this.value ? "true" : "false";
            return `${this.getSymbol()}  ${this.colors.bold(
              this.colors.white(this.key)
            )}${this.colors.subtle("=")}${this.colors.white(
              this.truncateValue(valueStr)
            )}`;
          }

          if (this.state === "cancel") {
            return this.renderCancelled();
          }

          let output = "";

          // Add header line with symbol based on state and key in bold white and description in gray if provided
          output += `${this.getSymbol()}  ${this.colors.bold(
            this.colors.white(this.key)
          )}`;
          if (this.spec.description) {
            output += ` ${this.colors.subtle(this.spec.description)}`;
          }
          output += "\n";

          // Create options array for true/false
          const options = [
            { value: true, label: "true" },
            { value: false, label: "false" },
          ];

          const dimInputs = this.shouldDimInputs();

          options.forEach((option, index) => {
            const isSelected = index === this.cursor;
            const circle = dimInputs
              ? this.colors.dim(
                  isSelected ? S_RADIO_ACTIVE : S_RADIO_INACTIVE
                )
              : isSelected
              ? this.theme.primary(S_RADIO_ACTIVE)
              : this.colors.dim(S_RADIO_INACTIVE);

            // Determine if this option matches current or default
            let annotation = "";
            if (
              this.current === option.value &&
              this.default === option.value
            ) {
              annotation = " (current, default)";
            } else if (this.current === option.value) {
              annotation = " (current)";
            } else if (this.default === option.value) {
              annotation = " (default)";
            }

            const text = dimInputs
              ? this.colors.dim(option.label)
              : isSelected
              ? this.colors.white(option.label)
              : this.colors.subtle(option.label);
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
        validate: (value: boolean | undefined) => {
          if (this.consumeSkipValidation()) {
            return undefined;
          }
          if (this.getOutcome() !== "commit") {
            return undefined;
          }

          const customValidation = this.runCustomValidate(value);
          if (customValidation) {
            return customValidation instanceof Error
              ? customValidation.message
              : customValidation;
          }
          return undefined;
        },
      }
    );

    // Set cursor based on priority: current → default → true
    // cursor 0 = true, cursor 1 = false
    let initialValue: boolean;
    if (this.current !== undefined) {
      initialValue = this.current;
    } else if (this.default !== undefined) {
      initialValue = this.default;
    } else {
      initialValue = true;
    }
    this.cursor = initialValue ? 0 : 1;

    // Set initial value to current, or default, or false
    this.setCommittedValue(this.current ?? this.default ?? false);

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
          this.cursor = this.cursor === 0 ? 1 : 0;
          break;
        case "down":
          this.cursor = this.cursor === 1 ? 0 : 1;
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
    // cursor 0 = true, cursor 1 = false
    this.setCommittedValue(this.cursor === 0);
  }
}
