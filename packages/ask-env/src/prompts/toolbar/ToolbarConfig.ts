import type { Theme } from "../../visuals/Theme";

export interface ToolbarConfig {
  index: number;
  secret: "shown" | "hidden" | false;
  theme: Theme;
  actions: {
    toggleSecret: () => void;
    skip: () => void;
    previous: () => void;
  };
}