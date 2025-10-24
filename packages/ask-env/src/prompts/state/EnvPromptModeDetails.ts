/**
 * Primary interaction kinds for the prompt
 */
export type InteractionKind =
  | "selection" // Navigating predefined options
  | "typing" // Text input mode
  | "toolbar"; // Toolbar navigation

/**
 * What the user intends to do when they submit
 */
export type IntentionState =
  | "commit" // Submit the current value
  | "skip" // Skip this prompt
  | "previous"; // Go back to previous prompt

/**
 * Secret visibility for sensitive fields
 */
export type SecretVisibility =
  | "hidden" // Secret is masked
  | "revealed" // Secret is shown
  | "not-secret"; // Field is not a secret

/**
 * Validation state independent of base prompt error state
 */
export type ValidationState =
  | "pending" // Not yet validated
  | "valid" // Passes validation
  | "invalid" // Has validation errors
  | "suppressed"; // Validation temporarily disabled

/**
 * Core mode details for an EnvPrompt
 */
export interface EnvPromptModeDetails {
  readonly mode: InteractionKind;
  readonly intention: IntentionState;
  readonly secretVisibility: SecretVisibility;
  readonly validation: ValidationState;
  readonly cursor: number;
  readonly inputValue: string;
  readonly toolbarOpen: boolean;
  readonly consumeSubmit: boolean;
}

/**
 * Computed properties derived from the mode details
 */
export interface EnvPromptComputedState {
  readonly canSubmit: boolean;
  readonly shouldTrackInput: boolean;
  readonly shouldDimUI: boolean;
  readonly shouldConsumeSubmit: boolean;
  readonly shouldSkipValidation: boolean;
}

/**
 * Complete state including both core mode details and computed properties
 */
export interface EnvPromptState
  extends EnvPromptModeDetails,
    EnvPromptComputedState {}

/**
 * Creates initial mode details for a prompt
 */
export function createInitialModeDetails(options: {
  hasSecret: boolean;
  hasOptions: boolean;
  initialInputValue?: string;
}): EnvPromptModeDetails {
  return {
    mode: options.hasOptions ? "selection" : "typing",
    intention: "commit",
    secretVisibility: options.hasSecret ? "hidden" : "not-secret",
    validation: "pending",
    cursor: 0,
    inputValue: options.initialInputValue || "",
    toolbarOpen: false,
    consumeSubmit: false,
  };
}

/**
 * Computes derived state from the core mode details
 */
export function computeState(
  modeDetails: EnvPromptModeDetails,
): EnvPromptComputedState {
  return {
    canSubmit:
      modeDetails.intention === "commit" &&
      modeDetails.validation !== "invalid",
    shouldTrackInput: modeDetails.mode === "typing",
    shouldDimUI: modeDetails.toolbarOpen,
    shouldConsumeSubmit: modeDetails.consumeSubmit,
    shouldSkipValidation: modeDetails.validation === "suppressed",
  };
}

/**
 * Creates complete state by combining mode details and computed properties
 */
export function createState(modeDetails: EnvPromptModeDetails): EnvPromptState {
  return {
    ...modeDetails,
    ...computeState(modeDetails),
  };
}
