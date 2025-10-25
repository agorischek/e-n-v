import { EnvPrompt } from "../EnvPrompt";
import type { EnvPromptOptions } from "../options/EnvPromptOptions";
import { S_RADIO_ACTIVE, S_RADIO_INACTIVE } from "../../visuals/symbols";
import type { Key } from "node:readline";
import type { PromptAction } from "../../types/PromptAction";
import type { BooleanEnvVarSchema } from "@envcredible/core";

type BooleanPromptOption = {
  key: "invalid" | "true" | "false";
  value: boolean | undefined;
  display: string;
  annotation?: string;
  invalid?: boolean;
};

export class EnvBooleanPrompt extends EnvPrompt<boolean, BooleanEnvVarSchema> {
  cursor: number;

  constructor(schema: BooleanEnvVarSchema, opts: EnvPromptOptions<boolean>) {
    super(schema, {
      ...opts,
      render: function (this: EnvBooleanPrompt) {
        if (this.state === "submit") {
          const outcomeResult = this.renderOutcomeResult();
          if (outcomeResult) {
            return outcomeResult;
          }

          const valueStr = this.value ? "true" : "false";
          return `${this.getSymbol()}  ${this.colors.bold(
            this.colors.white(this.key),
          )}${this.colors.subtle("=")}${this.colors.white(
            this.truncateValue(valueStr),
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
        if (this.schema.description) {
          output += ` ${this.colors.subtle(this.schema.description)}`;
        }
        output += "\n";

        const options = this.buildOptions();

        const dimInputs = !this.error && this.mode.isToolbarOpen();

        options.forEach((option, index) => {
          const isSelected = index === this.cursor;
          const circle = dimInputs
            ? this.colors.dim(isSelected ? S_RADIO_ACTIVE : S_RADIO_INACTIVE)
            : isSelected
              ? this.theme.primary(S_RADIO_ACTIVE)
              : this.colors.dim(S_RADIO_INACTIVE);

          const formatText = (value: string): string => {
            if (dimInputs) {
              return this.colors.dim(value);
            }
            if (isSelected) {
              return this.colors.white(value);
            }
            return this.colors.subtle(value);
          };

          let text = formatText(option.display);
          if (option.invalid) {
            text = `\u001b[9m${text}\u001b[29m`;
          }

          const annotation = option.annotation ? ` (${option.annotation})` : "";
          let suffix = "";
          if (annotation && isSelected) {
            suffix = dimInputs
              ? this.colors.dim(annotation)
              : this.colors.subtle(annotation);
          }

          output += `${this.getBar()}  ${circle} ${text}${suffix}\n`;
        });

        // Add validation output with L-shaped pipe
        output += `${this.getBarEnd()}  ${this.renderFooter()}`;

        return output;
      },
      validate: (value: boolean | undefined) => {
        if (this.consumeSkipValidation()) {
          return undefined;
        }
        if (this.getOutcome() !== "commit") {
          return undefined;
        }

        const selectedOption = this.getSelectedOption();

        if (selectedOption?.invalid) {
          return this.currentResult?.error ?? "Current value is invalid";
        }

        const candidateValue =
          selectedOption && selectedOption.value !== undefined
            ? selectedOption.value
            : this.default ?? false;

        const validation = this.runSchemaValidation(
          candidateValue.toString(),
        );
        if (!validation.success) {
          return validation.error;
        }
        return undefined;
      },
    } as any);

    const options = this.buildOptions();
    this.cursor = this.getInitialCursor(options);
    this.updateValue();

    this.on("cursor", (action?: PromptAction) => {
      // Clear error state when user navigates (like base Prompt class does)
      this.clearErrorState();

      if (!this.error && this.mode.isToolbarOpen()) {
        return;
      }

      const options = this.buildOptions();
      if (!options.length) {
        return;
      }

      const lastIndex = options.length - 1;

      switch (action) {
        case "up":
          this.cursor = this.cursor === 0 ? lastIndex : this.cursor - 1;
          break;
        case "down":
          this.cursor = this.cursor >= lastIndex ? 0 : this.cursor + 1;
          break;
        default:
          if (this.cursor > lastIndex) {
            this.cursor = lastIndex;
          }
          if (this.cursor < 0) {
            this.cursor = 0;
          }
          break;
      }

      this.updateValue();
    });

    this.on("key", (char: string | undefined, info: Key) => {
      if (!info) return; // Guard against undefined info

      // Clear error state when user types (like base Prompt class does)
      this.clearErrorState();

      if (this.handleToolbarKey(char, info)) {
        return;
      }
      if (!this.error && this.mode.isToolbarOpen()) {
        return;
      }
    });
  }

  private updateValue(): void {
    const selected = this.getSelectedOption();

    if (!selected || selected.invalid) {
      this.setCommittedValue(this.default ?? false);
      return;
    }

    this.setCommittedValue(selected.value ?? this.default ?? false);
  }

  private buildOptions(): BooleanPromptOption[] {
    const options: BooleanPromptOption[] = [];

    const currentRaw = this.currentResult?.rawValue;
    const isInvalidCurrent =
      currentRaw !== undefined && this.currentResult?.isValid === false;

    if (isInvalidCurrent) {
      options.push({
        key: "invalid",
        value: undefined,
        display: this.truncateValue(currentRaw ?? ""),
        annotation: this.buildAnnotation({
          isCurrent: true,
          invalid: true,
        }) ?? undefined,
        invalid: true,
      });
    }

    options.push({
      key: "true",
      value: true,
      display: "true",
      annotation: this.getAnnotationLabel(true) ?? undefined,
    });

    options.push({
      key: "false",
      value: false,
      display: "false",
      annotation: this.getAnnotationLabel(false) ?? undefined,
    });

    return options;
  }

  private getInitialCursor(options: BooleanPromptOption[]): number {
    const findIndexForValue = (target?: boolean): number => {
      if (target === undefined) {
        return -1;
      }
      return options.findIndex(
        (option) => !option.invalid && option.value === target,
      );
    };

    const currentValue =
      this.currentResult?.isValid !== false ? this.current : undefined;
    const currentIndex = findIndexForValue(currentValue);
    if (currentIndex >= 0) {
      return currentIndex;
    }

    const defaultIndex = findIndexForValue(this.default);
    if (defaultIndex >= 0) {
      return defaultIndex;
    }

    const firstValid = options.findIndex((option) => !option.invalid);
    return firstValid >= 0 ? firstValid : 0;
  }

  private getSelectedOption(): BooleanPromptOption | undefined {
    const options = this.buildOptions();
    if (!options.length) {
      return undefined;
    }

    const index = Math.max(0, Math.min(this.cursor, options.length - 1));
    if (index !== this.cursor) {
      this.cursor = index;
    }

    return options[index];
  }
}
