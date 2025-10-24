import { EnvPrompt } from "../EnvPrompt";
import type { EnvPromptOptions } from "../options/EnvPromptOptions";
import {
  S_RADIO_ACTIVE,
  S_RADIO_INACTIVE,
  S_CURSOR,
  SECRET_MASK,
} from "../../visuals/symbols";
import type { Key } from "node:readline";
import type { PromptAction } from "../../types/PromptAction";
import { maskSecretValue } from "../../utils/secrets";
import type { StringEnvVarSchema } from "@envcredible/core";
import { padActiveRender } from "../utils/padActiveRender";

export class EnvStringPrompt extends EnvPrompt<string, StringEnvVarSchema> {
  constructor(schema: StringEnvVarSchema, opts: EnvPromptOptions<string>) {
    super(schema, {
      ...opts,
      render: padActiveRender(function (this: EnvStringPrompt) {
        if (this.state === "submit") {
          const outcomeResult = this.renderOutcomeResult();
          if (outcomeResult) {
            return outcomeResult;
          }

          return `${this.getSymbol()}  ${this.colors.bold(
            this.colors.white(this.key),
          )}${this.colors.subtle("=")}${this.colors.white(
            this.formatValue(this.value),
          )}`;
        }

        if (this.state === "cancel") {
          return this.renderCancelled();
        }

        let output = "";

        output += `${this.getSymbol()}  ${this.colors.bold(
          this.colors.white(this.key),
        )}`;
        if (this.schema.description) {
          output += ` ${this.colors.subtle(this.schema.description)}`;
        }
        output += "\n";

        const dimInputs = this.shouldDimInputs();

        if (this.current === undefined && this.default === undefined) {
          const displayText = dimInputs
            ? this.colors.dim(this.getInputDisplay(false))
            : this.colors.white(this.getInputDisplay(true));
          output += `${this.getBar()}  ${displayText}`;
          output += "\n";
          output += `${this.getBarEnd()}  ${this.renderFooter(this.getEntryHint())}`;
          return output;
        }

        const options: Array<
          { value: string | undefined; label: string } | string
        > = [];

        if (this.current !== undefined) {
          if (this.default !== undefined && this.current === this.default) {
            options.push({
              value: this.current,
              label: "(current, default)",
            });
          } else {
            options.push({ value: this.current, label: "(current)" });
          }
        }

        if (this.default !== undefined && this.current !== this.default) {
          options.push({ value: this.default, label: "(default)" });
        }

        options.push("Other");

        options.forEach((option, index) => {
          const isSelected = index === this.substate.getCursor();
          const circle = dimInputs
            ? this.colors.dim(isSelected ? S_RADIO_ACTIVE : S_RADIO_INACTIVE)
            : isSelected
              ? this.theme.primary(S_RADIO_ACTIVE)
              : this.colors.dim(S_RADIO_INACTIVE);

          if (typeof option === "string") {
            if (this.substate.isInMode("typing")) {
              const displayText = dimInputs
                ? this.colors.dim(this.getInputDisplay(false))
                : this.colors.white(this.getInputDisplay(true));
              output += `${this.getBar()}  ${circle} ${displayText}\n`;
            } else if (isSelected) {
              if (dimInputs) {
                output += `${this.getBar()}  ${circle} ${this.colors.dim(option)}\n`;
              } else {
                output += `${this.getBar()}  ${circle} ${this.colors.white(this.getInputDisplay(true))}\n`;
              }
            } else {
              const text = dimInputs
                ? this.colors.dim(option)
                : this.colors.subtle(option);
              output += `${this.getBar()}  ${circle} ${text}\n`;
            }
          } else {
            const displayValue = this.formatValue(option.value);
            const text = dimInputs
              ? this.colors.dim(displayValue)
              : isSelected
                ? this.colors.white(displayValue)
                : this.colors.subtle(displayValue);
            const annotation = ` ${option.label}`;
            let suffix = "";
            if (isSelected) {
              suffix = dimInputs
                ? this.colors.dim(annotation)
                : this.colors.subtle(annotation);
            }
            output += `${this.getBar()}  ${circle} ${text}${suffix}\n`;
          }
        });

        output += `${this.getBarEnd()}  ${this.renderFooter(this.getEntryHint())}`;
        return output;
      }),
      validate: (value: string | undefined) => {
        if (this.consumeSkipValidation()) {
          return undefined;
        }
        if (this.getOutcome() !== "commit") {
          return undefined;
        }

        if (this.current === undefined && this.default === undefined) {
          const input = this.userInput ?? "";
          if (!input.trim()) {
            if (this.required) {
              return "Please enter a value";
            }
            return undefined;
          }

          const inputValidation = this.validateInput(input);
          if (inputValidation) {
            return inputValidation;
          }

          const validation = this.runSchemaValidation(input);
          if (!validation.success) {
            return validation.error;
          }
          return undefined;
        }

        const textInputIndex = this.getTextInputIndex();

        if (
          this.substate.getCursor() === textInputIndex &&
          !this.substate.isInMode("typing")
        ) {
          this.substate.enterTypingMode();
          this.substate.clearInput();
          this._setUserInput("");
          this.updateValue();
          return "Value cannot be empty";
        }

        if (
          this.substate.getCursor() === textInputIndex &&
          this.substate.isInMode("typing") &&
          !(this.userInput && this.userInput.trim())
        ) {
          if (this.required) {
            return "Please enter a value";
          }
          return undefined;
        }

        if (this.substate.isInMode("typing") && this.userInput) {
          const inputValidation = this.validateInput(this.userInput);
          if (inputValidation) {
            return inputValidation;
          }
          const validation = this.runSchemaValidation(this.userInput);
          if (!validation.success) {
            return validation.error;
          }
        }

        if (!this.substate.isInMode("typing")) {
          const validation = this.runSchemaValidation(value);
          if (!validation.success) {
            return validation.error;
          }
        }

        return undefined;
      },
    } as any);

    if (this.current === undefined && this.default === undefined) {
      this.substate.enterTypingMode();
      this.substate.clearInput();
      this._setUserInput("");
      this.setCommittedValue(this.getDefaultValue());
    } else {
      this.setCommittedValue(this.current ?? this.getDefaultValue());
    }

    this.on("cursor", (action?: PromptAction) => {
      if (this.state === "error") {
        this.state = "active";
        this.error = "";
      }

      if (this.current === undefined && this.default === undefined) {
        return;
      }

      if (this.isOptionPickerOpen()) {
        return;
      }

      switch (action) {
        case "up": {
          let optionsCount = 0;
          if (this.current !== undefined) optionsCount++;
          if (this.default !== undefined && this.current !== this.default)
            optionsCount++;
          optionsCount++;
          const maxIndex = optionsCount - 1;

          if (
            this.substate.isInMode("typing") ||
            this.substate.getCursor() === maxIndex
          ) {
            this.substate.exitTypingMode();
            this._clearUserInput();
            this.substate.clearInput();
          }
          this.substate.moveCursor("up", maxIndex);
          break;
        }
        case "down": {
          let optionsCount = 0;
          if (this.current !== undefined) optionsCount++;
          if (this.default !== undefined && this.current !== this.default)
            optionsCount++;
          optionsCount++;
          const maxIndex = optionsCount - 1;

          if (
            this.substate.isInMode("typing") ||
            this.substate.getCursor() === maxIndex
          ) {
            this.substate.exitTypingMode();
            this._clearUserInput();
            this.substate.clearInput();
          }
          this.substate.moveCursor("down", maxIndex);
          break;
        }
      }
      this.updateValue();
    });

    this.on("userInput", (input: string) => {
      if (this.state === "error") {
        this.state = "active";
        this.error = "";
      }

      if (this.substate.isInMode("typing")) {
        this.substate.updateInput(input);
        try {
          const parsed = this.parseInput(input);
          this.setCommittedValue(parsed ?? this.getDefaultValue());
        } catch {
          // Keep the current value; validation will surface errors when needed.
        }
      }
    });

    this.on("key", (char: string | undefined, info: Key) => {
      if (!info) return;

      if (this.state === "error") {
        this.state = "active";
        this.error = "";
      }

      if (this.handleToolbarKey(char, info)) {
        return;
      }

      if (this.isOptionPickerOpen()) {
        return;
      }

      if (this.current === undefined && this.default === undefined) {
        if (this.substate.isInMode("typing")) {
          try {
            const parsed = this.parseInput(this.userInput);
            this.setCommittedValue(parsed ?? this.getDefaultValue());
          } catch {
            // Swallow parse errors here; validation handles them later.
          }
        }
        return;
      }

      if (
        char &&
        char.length === 1 &&
        !info.ctrl &&
        !info.meta &&
        !this.substate.isInMode("typing")
      ) {
        const isArrowKey = ["up", "down", "left", "right"].includes(
          info.name || "",
        );
        const isControlKey = ["return", "enter", "escape", "tab"].includes(
          info.name || "",
        );

        if (!isArrowKey && !isControlKey) {
          const textInputIndex = this.getTextInputIndex();
          this.substate.setCursor(textInputIndex);
          this.substate.enterTypingMode(char);
          this._setUserInput(char);
          this.substate.updateInput(char);
          this.updateValue();
          return;
        }
      }

      const textInputIndex = this.getTextInputIndex();

      if (this.substate.getCursor() === textInputIndex) {
        if (info.name === "escape") {
          this.substate.exitTypingMode();
          this._clearUserInput();
          this.substate.clearInput();
          this.updateValue();
          return;
        }
      }
    });
  }

  get cursor(): number {
    return this.substate.getCursor();
  }

  get isTyping(): boolean {
    return this.substate.isInMode("typing");
  }

  private updateValue() {
    if (this.current === undefined && this.default === undefined) {
      try {
        const parsed = this.parseInput(this.substate.getInputValue());
        this.setCommittedValue(parsed ?? this.getDefaultValue());
      } catch {
        this.setCommittedValue(this.getDefaultValue());
      }
      return;
    }

    if (!this.substate.isInMode("typing")) {
      let optionIndex = 0;

      if (this.current !== undefined && this.substate.getCursor() === optionIndex) {
        this.setCommittedValue(this.current);
        return;
      }
      if (this.current !== undefined) optionIndex++;

      if (
        this.default !== undefined &&
        this.current !== this.default &&
        this.substate.getCursor() === optionIndex
      ) {
        this.setCommittedValue(this.default);
        return;
      }
      if (this.default !== undefined && this.current !== this.default)
        optionIndex++;

      this.setCommittedValue(this.getDefaultValue());
    } else {
      try {
        const parsed = this.parseInput(this.substate.getInputValue());
        this.setCommittedValue(parsed ?? this.getDefaultValue());
      } catch {
        this.setCommittedValue(this.getDefaultValue());
      }
    }
  }

  protected formatValue(value: string | undefined): string {
    const str = value || "";
    const display =
      this.secret && str && !this.isSecretRevealed()
        ? this.maskValue(str)
        : str;
    return this.truncateValue(display);
  }

  protected parseInput(input: string): string | undefined {
    return input || undefined;
  }

  protected validateInput(_input: string): string | undefined {
    return undefined;
  }

  protected getDefaultValue(): string {
    return "";
  }

  private maskValue(value: string): string {
    return maskSecretValue(value, SECRET_MASK);
  }

  private getTextInputIndex(): number {
    let index = 0;
    if (this.current !== undefined) index++;
    if (this.default !== undefined && this.current !== this.default) index++;
    return index;
  }

  private getInputDisplay(includeCursor: boolean): string {
    const inputValue = this.substate.getInputValue();
    const isMasked = this.secret && inputValue && !this.isSecretRevealed();
    const base = isMasked ? this.maskValue(inputValue) : inputValue;

    if (!includeCursor) {
      return base;
    }

    const rawCursor = this.substate.isInMode("typing")
      ? Math.max(
          0,
          (this as unknown as { _cursor?: number })._cursor ??
            inputValue.length,
        )
      : 0;
    const maskLength = isMasked ? Math.max(1, SECRET_MASK.length) : 1;
    const cursorIndex = Math.min(rawCursor * maskLength, base.length);

    if (cursorIndex >= base.length) {
      return `${base}${S_CURSOR}`;
    }

    const segmentLength = maskLength;
    const before = base.slice(0, cursorIndex);
    const cursorSegment =
      base.slice(cursorIndex, cursorIndex + segmentLength) || " ";
    const after = base.slice(cursorIndex + segmentLength);

    return `${before}${this.colors.inverse(cursorSegment)}${after}`;
  }

  private getEntryHint(): string {
    return this.secret ? "Enter a secret value" : "Enter a value";
  }
}
