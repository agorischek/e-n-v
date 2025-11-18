import type { Theme } from "../../visuals/Theme";

export interface ToolbarConfig {
  previous: boolean;
  secret: "shown" | "hidden" | false;
  link?: string;
  theme: Theme;
  actions: {
    toggleSecret: () => void;
    skip: () => void;
    previous: () => void;
    openLink: () => void;
  };
}
