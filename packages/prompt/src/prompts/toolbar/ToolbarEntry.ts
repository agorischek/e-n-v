export interface ToolbarEntry {
  key: "skip" | "previous" | "toggleSecret";
  label: string;
  disabled?: boolean;
  action: () => void;
}
