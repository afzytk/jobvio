import { useContext } from "react";
import { ThemeProviderContext } from "../context/theme-context";

/**
 * Access and update the current theme ("light" | "dark" | "system").
 * Must be used within a <ThemeProvider>.
 */
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
