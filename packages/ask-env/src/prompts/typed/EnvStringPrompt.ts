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

type StringPromptOption =
  | {
      type: "value";
      key: "current" | "default";
      value: string | undefined;
      display: string;
      annotation?: string;
      invalid?: boolean;
    }
  | { type: "other"; label: string };

export class EnvStringPrompt extends EnvPrompt<string, StringEnvVarSchema> {
  private otherInputCache = "";
  private shouldStitchInput = false;
  private isRestoringInput = false;

  constructor(schema: StringEnvVarSchema, opts: EnvPromptOptions<string>) {
    super(schema, {
      ...opts,
      render: function (this: EnvStringPrompt) {
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

        const dimInputs = !this.error && this.mode.isToolbarOpen();
        const hasPresetOptions = this.hasPresetOptions();

        if (!hasPresetOptions) {
          const displayText = dimInputs
            ? this.colors.dim(this.getInputDisplay(false))
            : this.colors.white(this.getInputDisplay(true));
          output += `${this.getBar()}  ${displayText}`;
          output += "\n";
          output += `${this.getBarEnd()}  ${this.renderFooter(this.getEntryHint())}`;
          return output;
        }

        const options = this.buildSelectionOptions();

  options.forEach((option: StringPromptOption, index: number) => {
          const isSelected = index === this.mode.getCursor();
          const circle = dimInputs
            ? this.colors.dim(isSelected ? S_RADIO_ACTIVE : S_RADIO_INACTIVE)
            : isSelected
              ? this.theme.primary(S_RADIO_ACTIVE)
              : this.colors.dim(S_RADIO_INACTIVE);

          if (option.type === "other") {
            if (this.mode.isInInteraction("typing")) {
              const displayText = dimInputs
                ? this.colors.dim(this.getInputDisplay(false))
                : this.colors.white(this.getInputDisplay(true));
              output += `${this.getBar()}  ${circle} ${displayText}\n`;
            } else if (isSelected) {
              if (dimInputs) {
                output += `${this.getBar()}  ${circle} ${this.colors.dim(option.label)}\n`;
              } else {
                output += `${this.getBar()}  ${circle} ${this.colors.white(this.getInputDisplay(true))}\n`;
              }
            } else {
              const text = dimInputs
                ? this.colors.dim(option.label)
                : this.colors.subtle(option.label);
              output += `${this.getBar()}  ${circle} ${text}\n`;
            }
            return;
          }

          let text = dimInputs
            ? this.colors.dim(option.display)
            : isSelected
              ? this.colors.white(option.display)
              : this.colors.subtle(option.display);

          if (option.invalid) {
            text = this.colors.strikethrough(text);
          }

          const annotation = option.annotation ? ` (${option.annotation})` : "";
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

        output += `${this.getBarEnd()}  ${this.renderFooter(this.getEntryHint())}`;
        return output;
      },
      validate: (value: string | undefined) => {
        if (this.consumeSkipValidation()) {
          return undefined;
        }
        if (this.getOutcome() !== "commit") {
          return undefined;
        }

        const hasPresetOptions = this.hasPresetOptions();

        if (!hasPresetOptions) {
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

        const selectedOption = this.getSelectedOption();

        if (
          !this.mode.isInInteraction("typing") &&
          selectedOption &&
          selectedOption.type === "value" &&
          selectedOption.key === "current" &&
          selectedOption.invalid
        ) {
          return this.currentResult?.error ?? "Current value is invalid";
        }

        const textInputIndex = this.getTextInputIndex();

        if (
          this.mode.getCursor() === textInputIndex &&
          !this.mode.isInInteraction("typing")
        ) {
          this.mode.enterTyping();
          this.mode.clearInput();
          this._setUserInput("");
          this.otherInputCache = "";
          this.updateValue();
          return "Value cannot be empty";
        }

        if (
          this.mode.getCursor() === textInputIndex &&
          this.mode.isInInteraction("typing") &&
          !(this.userInput && this.userInput.trim())
        ) {
          if (this.required) {
            return "Please enter a value";
          }
          return undefined;
        }

        if (this.mode.isInInteraction("typing") && this.userInput) {
          const inputValidation = this.validateInput(this.userInput);
          if (inputValidation) {
            return inputValidation;
          }
          const validation = this.runSchemaValidation(this.userInput);
          if (!validation.success) {
            return validation.error;
          }
        }

        if (!this.mode.isInInteraction("typing")) {
          const validation = this.runSchemaValidation(value);
          if (!validation.success) {
            return validation.error;
          }
        }

        return undefined;
      },
    } as any);

    if (!this.hasPresetOptions()) {
      this.mode.enterTyping();
      this.mode.clearInput();
      this._setUserInput("");
      this.otherInputCache = "";
      this.setCommittedValue(this.getDefaultValue());
    } else {
      const initialValue =
        this.currentResult && this.currentResult.isValid ? this.current : undefined;
      this.setCommittedValue(initialValue ?? this.getDefaultValue());
    }

    this.on("cursor", (action?: PromptAction) => {
      if (this.state === "error") {
        this.state = "active";
        this.error = "";
      }

      if (!this.hasPresetOptions()) {
        return;
      }

      if (!this.error && this.mode.isToolbarOpen()) {
        return;
      }

      switch (action) {
        case "up": {
          const options = this.buildSelectionOptions();
          const maxIndex = options.length - 1;

          if (
            this.mode.isInInteraction("typing") ||
            this.mode.getCursor() === maxIndex
          ) {
            this.mode.exitTyping();
            this._clearUserInput();
            this.mode.clearInput();
            this.otherInputCache = "";
          }
          this.mode.moveCursor("up", maxIndex);
          break;
        }
        case "down": {
          const options = this.buildSelectionOptions();
          const maxIndex = options.length - 1;

          if (
            this.mode.isInInteraction("typing") ||
            this.mode.getCursor() === maxIndex
          ) {
            this.mode.exitTyping();
            this._clearUserInput();
            this.mode.clearInput();
            this.otherInputCache = "";
          }
          this.mode.moveCursor("down", maxIndex);
          break;
        }
      }
      this.updateValue();
    });

    this.on("userInput", (rawInput: string) => {
      if (this.state === "error") {
        this.state = "active";
        this.error = "";
      }

      let input = rawInput.includes("\t")
        ? rawInput.replace(/\t/g, "")
        : rawInput;

      if (this.isRestoringInput) {
        this.isRestoringInput = false;
        this.otherInputCache = input;
        return;
      }

      if (this.mode.isInInteraction("typing")) {
        let nextInput = input;

        if (this.shouldStitchInput && this.otherInputCache) {
          if (!input || input === this.otherInputCache) {
            nextInput = this.otherInputCache;
            // keep shouldStitchInput true until new characters arrive
          } else if (input.startsWith(this.otherInputCache)) {
            nextInput = input;
            this.shouldStitchInput = false;
          } else {
            nextInput = `${this.otherInputCache}${input}`;
            this.shouldStitchInput = false;
          }
        } else {
          this.shouldStitchInput = false;
        }

        this.mode.updateInput(nextInput);
        (this as unknown as { userInput: string }).userInput = nextInput;
        this.otherInputCache = nextInput;
        try {
          const parsed = this.parseInput(nextInput);
          this.setCommittedValue(parsed ?? this.getDefaultValue());
        } catch {
          // Keep the current value; validation will surface errors when needed.
        }
      } else {
        this.shouldStitchInput = false;
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

      if (!this.error && this.mode.isToolbarOpen()) {
        return;
      }

      if (!this.hasPresetOptions()) {
        if (this.mode.isInInteraction("typing")) {
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
        !this.mode.isInInteraction("typing")
      ) {
        const isArrowKey = ["up", "down", "left", "right"].includes(
          info.name || "",
        );
        const isControlKey = ["return", "enter", "escape", "tab"].includes(
          info.name || "",
        );

        if (!isArrowKey && !isControlKey) {
          const textInputIndex = this.getTextInputIndex();
          this.mode.setCursor(textInputIndex);
          const existingInput =
            this.mode.getInputValue() ||
            this.userInput ||
            this.otherInputCache ||
            "";

          this.mode.enterTyping(existingInput);
          const nextInput = `${existingInput}${char}`;
          this.otherInputCache = nextInput;
          this._setUserInput(nextInput);
          this.mode.updateInput(nextInput);
          this.syncCursorToInputEnd();
          this.updateValue();
          return;
        }
      }

      const textInputIndex = this.getTextInputIndex();

      if (this.mode.getCursor() === textInputIndex) {
        if (info.name === "escape") {
          this.mode.exitTyping();
          this._clearUserInput();
          this.mode.clearInput();
          this.otherInputCache = "";
          this.updateValue();
          return;
        }
      }
    });
  }

  get cursor(): number {
    return this.mode.getCursor();
  }

  get isTyping(): boolean {
    return this.mode.isInInteraction("typing");
  }

  private updateValue() {
    if (!this.hasPresetOptions()) {
      try {
        const parsed = this.parseInput(this.mode.getInputValue());
        this.setCommittedValue(parsed ?? this.getDefaultValue());
      } catch {
        this.setCommittedValue(this.getDefaultValue());
      }
      return;
    }

    if (!this.mode.isInInteraction("typing")) {
      const options = this.buildSelectionOptions();
      const selected = options[this.mode.getCursor()];

      if (!selected) {
        this.setCommittedValue(this.getDefaultValue());
        return;
      }

      if (selected.type === "value") {
        if (selected.invalid) {
          this.setCommittedValue(this.getDefaultValue());
          return;
        }
        this.setCommittedValue(selected.value ?? this.getDefaultValue());
        return;
      }

      this.setCommittedValue(this.getDefaultValue());
      return;
    }

    try {
      const parsed = this.parseInput(this.mode.getInputValue());
      this.setCommittedValue(parsed ?? this.getDefaultValue());
    } catch {
      this.setCommittedValue(this.getDefaultValue());
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

  private hasPresetOptions(): boolean {
    return (
      this.currentResult?.rawValue !== undefined ||
      this.default !== undefined
    );
  }

  private buildSelectionOptions(): StringPromptOption[] {
    const options: StringPromptOption[] = [];
    const currentRaw = this.currentResult?.rawValue;
    const hasValidCurrent =
      this.currentResult?.isValid !== false && this.current !== undefined;

    if (currentRaw !== undefined) {
      const isValid = this.currentResult?.isValid !== false;
      const isSameAsDefault =
        isValid && hasValidCurrent && this.current === this.default;
      const display = isValid && hasValidCurrent
        ? this.formatValue(this.current)
        : this.formatRawValue(currentRaw);

      options.push({
        type: "value",
        key: "current",
        value: isValid ? this.current : undefined,
        display,
        annotation: this.buildAnnotation({
          isCurrent: true,
          isDefault: isSameAsDefault,
          invalid: !isValid,
        }),
        invalid: !isValid,
      });
    }

    const shouldIncludeDefault =
      this.default !== undefined &&
      (!hasValidCurrent || this.current !== this.default);

    if (shouldIncludeDefault) {
      const isSameAsCurrent =
        hasValidCurrent && this.current === this.default;

      options.push({
        type: "value",
        key: "default",
        value: this.default,
        display: this.formatValue(this.default),
        annotation: this.buildAnnotation({
          isDefault: true,
          isCurrent: isSameAsCurrent,
        }),
      });
    }

    options.push({ type: "other", label: "Other" });

    return options;
  }

  private getSelectedOption(): StringPromptOption | undefined {
    if (!this.hasPresetOptions()) {
      return undefined;
    }

    const options = this.buildSelectionOptions();
    return options[this.mode.getCursor()];
  }

  private formatRawValue(raw: string): string {
    if (!raw) {
      return "";
    }

    const display =
      this.secret && !this.isSecretRevealed()
        ? this.maskValue(raw)
        : raw;
    return this.truncateValue(display);
  }

  private maskValue(value: string): string {
    return maskSecretValue(value, SECRET_MASK);
  }

  private getTextInputIndex(): number {
    if (!this.hasPresetOptions()) {
      return 0;
    }

    const options = this.buildSelectionOptions();
    const index = options.findIndex(
      (option: StringPromptOption) => option.type === "other",
    );
    return index === -1 ? options.length - 1 : index;
  }

  private getInputDisplay(includeCursor: boolean): string {
    const inputValue = this.mode.getInputValue();
    const isMasked = this.secret && inputValue && !this.isSecretRevealed();
    const base = isMasked ? this.maskValue(inputValue) : inputValue;

    if (!includeCursor) {
      return base;
    }

    const rawCursor = this.mode.isInInteraction("typing")
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

  private syncCursorToInputEnd(): void {
    const cursorHost = this as unknown as { _cursor?: number };
    const inputValue = this.mode.getInputValue();
    cursorHost._cursor = inputValue.length;
  }

  protected override toggleSecretReveal(): void {
    const cachedInput =
      this.mode.getInputValue() || this.userInput || this.otherInputCache;

    super.toggleSecretReveal();

    if (!cachedInput) {
      return;
    }

    this.shouldStitchInput = Boolean(this.otherInputCache || cachedInput);
    const stitchedBaseline = cachedInput;

    queueMicrotask(() => {
      const restored = this.otherInputCache || stitchedBaseline;
      if (!restored) {
        return;
      }

      if (!this.mode.isInInteraction("typing")) {
        this.mode.enterTyping(restored);
      }

      this.isRestoringInput = true;
      this.internals.track = true;
      this.mode.updateInput(restored);
      this.otherInputCache = restored;
      this._setUserInput(restored, true);
      this.syncCursorToInputEnd();
    });
  }
}
