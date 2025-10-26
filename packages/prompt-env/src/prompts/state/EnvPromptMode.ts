import type {
  EnvPromptModeDetails,
  EnvPromptState,
  InteractionKind,
  IntentionState,
  SecretVisibility,
  ValidationState,
} from "./EnvPromptModeDetails";
import { createState } from "./EnvPromptModeDetails";

/**
 * Encapsulates the prompt's interaction mode state and transitions.
 */
export class EnvPromptMode {
  private _details: EnvPromptModeDetails;
  private readonly _listeners: Array<(state: EnvPromptState) => void> = [];

  constructor(initialModeDetails: EnvPromptModeDetails) {
    this._details = { ...initialModeDetails };
  }

  get intention(): IntentionState {
    return this._details.intention;
  }

  set intention(intention: IntentionState) {
    this.updateModeDetails({ intention });
  }

  /**
   * Complete computed state for observers.
   */
  get state(): EnvPromptState {
    return createState(this._details);
  }

  /**
   * Snapshot of the raw mode details (without computed props).
   */
  get modeDetails(): EnvPromptModeDetails {
    return { ...this._details };
  }

  subscribe(listener: (state: EnvPromptState) => void): () => void {
    this._listeners.push(listener);
    return () => {
      const index = this._listeners.indexOf(listener);
      if (index >= 0) {
        this._listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    const snapshot = this.state;
    this._listeners.forEach((listener) => listener(snapshot));
  }

  private updateModeDetails(updates: Partial<EnvPromptModeDetails>): void {
    this._details = { ...this._details, ...updates };
    this.notifyListeners();
  }

  // Interaction transitions

  enterTyping(inputValue: string = ""): void {
    if (this._details.mode === "selection") {
      this.updateModeDetails({
        mode: "typing",
        inputValue,
        validation: "pending",
      });
    }
  }

  exitTyping(): void {
    if (this._details.mode === "typing") {
      this.updateModeDetails({
        mode: "selection",
        inputValue: "",
        validation: "pending",
      });
    }
  }

  openToolbar(): void {
    this.updateModeDetails({ toolbarOpen: true });
  }

  closeToolbar(): void {
    this.updateModeDetails({ toolbarOpen: false });
  }

  moveCursor(direction: "up" | "down", maxIndex: number): void {
    if (this._details.mode === "selection" && !this._details.toolbarOpen) {
      const delta = direction === "up" ? -1 : 1;
      let cursor = this._details.cursor + delta;

      if (cursor < 0) {
        cursor = maxIndex;
      } else if (cursor > maxIndex) {
        cursor = 0;
      }

      this.updateModeDetails({
        cursor,
        validation: "pending",
      });
    }
  }

  setCursor(position: number): void {
    if (this._details.mode === "selection") {
      this.updateModeDetails({
        cursor: position,
        validation: "pending",
      });
    }
  }

  setIntention(intention: IntentionState): void {
    this.intention = intention;
  }

  toggleSecretVisibility(): void {
    if (this._details.secretVisibility !== "not-secret") {
      const next: SecretVisibility =
        this._details.secretVisibility === "hidden" ? "revealed" : "hidden";

      this.updateModeDetails({
        secretVisibility: next,
        validation: "suppressed",
        consumeSubmit: true,
      });
    }
  }

  resetSecretVisibility(): void {
    if (this._details.secretVisibility === "revealed") {
      this.updateModeDetails({ secretVisibility: "hidden" });
    }
  }

  setValidationState(validation: ValidationState): void {
    this.updateModeDetails({ validation });
  }

  suppressValidation(): void {
    this.updateModeDetails({ validation: "suppressed", consumeSubmit: true });
  }

  restoreValidation(): void {
    if (this._details.validation === "suppressed") {
      this.updateModeDetails({ validation: "pending" });
    }
  }

  clearConsumeSubmit(): void {
    if (this._details.consumeSubmit) {
      this.updateModeDetails({ consumeSubmit: false });
    }
  }

  updateInput(value: string): void {
    if (this._details.mode === "typing") {
      this.updateModeDetails({
        inputValue: value,
        validation: "pending",
      });
    }
  }

  clearInput(): void {
    this.updateModeDetails({
      inputValue: "",
      validation: "pending",
    });
  }

  isInInteraction(kind: InteractionKind): boolean {
    return this._details.mode === kind;
  }

  canTransitionToInteraction(kind: InteractionKind): boolean {
    switch (kind) {
      case "typing":
        return this._details.mode === "selection" && !this._details.toolbarOpen;
      case "selection":
        return this._details.mode === "typing";
      case "toolbar":
        return !this._details.toolbarOpen;
      default:
        return false;
    }
  }

  shouldPreventSubmission(): boolean {
    const snapshot = this.state;
    return !snapshot.canSubmit || snapshot.shouldConsumeSubmit;
  }

  isToolbarOpen(): boolean {
    return this._details.toolbarOpen;
  }

  isSecretRevealed(): boolean {
    return this._details.secretVisibility === "revealed";
  }

  hasSecret(): boolean {
    return this._details.secretVisibility !== "not-secret";
  }

  getCursor(): number {
    return this._details.cursor;
  }

  getInputValue(): string {
    return this._details.inputValue;
  }

  getIntention(): IntentionState {
    return this.intention;
  }
}
