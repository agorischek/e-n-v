export interface FooterOption {
  key: "skip" | "previous" | "toggleSecret" | "close";
  label: string;
  icon?: string;
  activeIcon?: string;
  disabled?: boolean;
}
