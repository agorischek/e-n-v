export interface ToolbarEntry {
  key: "skip" | "previous" | "toggleSecret" | "openLink";
  label: string;
  disabled?: boolean;
  action: () => void;
}
