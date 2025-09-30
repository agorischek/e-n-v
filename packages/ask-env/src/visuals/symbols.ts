export const SKIP_SYMBOL = Symbol('ask-env:skip');

// Clack-style Unicode symbols for visual formatting
export const S_BAR = "│";           // Vertical bar (pipe)
export const S_BAR_END = "└";       // Bottom-left corner
export const S_BAR_START = "┌";     // Top-left corner
export const S_STEP_ACTIVE = "◆";   // Diamond filled (active state)
export const S_STEP_SUBMIT = "✔";   // Checkmark (submit/saved state)
export const S_STEP_SKIP = "⏭";     // Skip symbol (skipped state)
export const S_STEP_CANCEL = "✕";   // X mark (cancel state)
export const S_STEP_ERROR = "▲";
export const S_STEP_PREVIOUS = "⏮"; // Previous symbol

// Secret controls
export const S_SECRET_SHOW = "👁";
export const S_SECRET_HIDE = "🙈";

// Selection circles for multiple choice prompts
export const S_RADIO_ACTIVE = "●";  // Filled circle (selected)
export const S_RADIO_INACTIVE = "○"; // Empty circle (unselected)

// Cursor symbol
export const S_CURSOR = "█";        // Block cursor
