import { useEffect, useState } from "react";
import useLocalStorage from "use-local-storage";

export type Theme = "light" | "dark" | "system";

export function useTheme() {
  const [theme, setTheme] = useLocalStorage<Theme>("theme", "system");

  // Initialize resolvedTheme based on current theme (lazy initialization)

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    if (theme === "system") {
      try {
        return window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      } catch {
        return "light";
      }
    }

    // theme is either "light" or "dark" at this point
    if (theme === "light" || theme === "dark") {
      return theme;
    }

    // Fallback (should never happen)
    return "light";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Get system theme function
    const getSystemTheme = (): "light" | "dark" => {
      try {
        return window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      } catch {
        return "light";
      }
    };

    // Apply theme function
    const applyTheme = (themeToApply: Theme) => {
      const root = document.documentElement;
      const actualTheme =
        themeToApply === "system" ? getSystemTheme() : themeToApply;
      setResolvedTheme(actualTheme);

      if (actualTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    // Apply theme immediately
    applyTheme(theme);

    // Listen for system theme changes when theme is "system"
    let mediaQuery: MediaQueryList | null = null;
    let handleChange: (() => void) | null = null;

    if (theme === "system") {
      mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      // Handle media query changes (for Firefox compatibility, use both methods)
      handleChange = () => {
        applyTheme("system");
      };

      // Firefox support: addEventListener with proper event handling
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", handleChange);
      } else if (mediaQuery.addListener) {
        // Fallback for older browsers
        mediaQuery.addListener(handleChange);
      }
    }

    // Cleanup
    return () => {
      if (mediaQuery && handleChange) {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener("change", handleChange);
        } else if (mediaQuery.removeListener) {
          mediaQuery.removeListener(handleChange);
        }
      }
    };
  }, [theme]);

  return { theme, setTheme, resolvedTheme };
}
