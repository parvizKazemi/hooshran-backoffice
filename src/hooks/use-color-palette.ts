import { useEffect } from "react";
import useLocalStorage from "use-local-storage";

// Shadcn theme colors based on https://ui.shadcn.com/themes
export type ColorPalette =
  | "default"
  | "blue"
  | "green"
  | "orange"
  | "red"
  | "rose"
  | "violet"
  | "yellow";

const colorPalettes: Record<ColorPalette, { name: string; value: string }> = {
  default: { name: "Default", value: "default" },
  blue: { name: "Blue", value: "blue" },
  green: { name: "Green", value: "green" },
  orange: { name: "Orange", value: "orange" },
  red: { name: "Red", value: "red" },
  rose: { name: "Rose", value: "rose" },
  violet: { name: "Violet", value: "violet" },
  yellow: { name: "Yellow", value: "yellow" },
};

// Theme colors in OKLCH format based on shadcn themes
const themeColors: Record<
  ColorPalette,
  {
    light: {
      primary: string;
      primaryForeground: string;
      ring: string;
    };
    dark: {
      primary: string;
      primaryForeground: string;
      ring: string;
    };
  }
> = {
  default: {
    light: {
      primary: "oklch(0.205 0 0)",
      primaryForeground: "oklch(0.985 0 0)",
      ring: "oklch(0.708 0 0)",
    },
    dark: {
      primary: "oklch(0.922 0 0)",
      primaryForeground: "oklch(0.205 0 0)",
      ring: "oklch(0.556 0 0)",
    },
  },
  blue: {
    light: {
      primary: "oklch(0.5 0.2 264.376)",
      primaryForeground: "oklch(0.985 0 0)",
      ring: "oklch(0.5 0.2 264.376)",
    },
    dark: {
      primary: "oklch(0.7 0.2 264.376)",
      primaryForeground: "oklch(0.145 0 0)",
      ring: "oklch(0.7 0.2 264.376)",
    },
  },
  green: {
    light: {
      primary: "oklch(0.5 0.2 142.495)",
      primaryForeground: "oklch(0.985 0 0)",
      ring: "oklch(0.5 0.2 142.495)",
    },
    dark: {
      primary: "oklch(0.7 0.2 142.495)",
      primaryForeground: "oklch(0.145 0 0)",
      ring: "oklch(0.7 0.2 142.495)",
    },
  },
  orange: {
    light: {
      primary: "oklch(0.6 0.2 70.08)",
      primaryForeground: "oklch(0.985 0 0)",
      ring: "oklch(0.6 0.2 70.08)",
    },
    dark: {
      primary: "oklch(0.75 0.2 70.08)",
      primaryForeground: "oklch(0.145 0 0)",
      ring: "oklch(0.75 0.2 70.08)",
    },
  },
  red: {
    light: {
      primary: "oklch(0.577 0.245 27.325)",
      primaryForeground: "oklch(0.985 0 0)",
      ring: "oklch(0.577 0.245 27.325)",
    },
    dark: {
      primary: "oklch(0.704 0.191 22.216)",
      primaryForeground: "oklch(0.985 0 0)",
      ring: "oklch(0.704 0.191 22.216)",
    },
  },
  rose: {
    light: {
      primary: "oklch(0.6 0.2 16.439)",
      primaryForeground: "oklch(0.985 0 0)",
      ring: "oklch(0.6 0.2 16.439)",
    },
    dark: {
      primary: "oklch(0.75 0.2 16.439)",
      primaryForeground: "oklch(0.985 0 0)",
      ring: "oklch(0.75 0.2 16.439)",
    },
  },
  violet: {
    light: {
      primary: "oklch(0.5 0.2 303.9)",
      primaryForeground: "oklch(0.985 0 0)",
      ring: "oklch(0.5 0.2 303.9)",
    },
    dark: {
      primary: "oklch(0.7 0.2 303.9)",
      primaryForeground: "oklch(0.985 0 0)",
      ring: "oklch(0.7 0.2 303.9)",
    },
  },
  yellow: {
    light: {
      primary: "oklch(0.7 0.2 100)",
      primaryForeground: "oklch(0.145 0 0)",
      ring: "oklch(0.7 0.2 100)",
    },
    dark: {
      primary: "oklch(0.85 0.2 100)",
      primaryForeground: "oklch(0.145 0 0)",
      ring: "oklch(0.85 0.2 100)",
    },
  },
};

export function useColorPalette() {
  const [colorPalette, setColorPalette] = useLocalStorage<ColorPalette>(
    "color-palette",
    "default"
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    const theme = themeColors[colorPalette];
    const colors = isDark ? theme.dark : theme.light;

    // Update CSS variables for primary colors
    root.style.setProperty("--primary", colors.primary);
    root.style.setProperty("--primary-foreground", colors.primaryForeground);
    root.style.setProperty("--ring", colors.ring);

    // Update sidebar primary colors if they exist
    if (root.style.getPropertyValue("--sidebar-primary")) {
      root.style.setProperty("--sidebar-primary", colors.primary);
      root.style.setProperty(
        "--sidebar-primary-foreground",
        colors.primaryForeground
      );
    }

    // Update data attribute for theme
    root.setAttribute("data-theme", colorPalette);
  }, [colorPalette]);

  // Listen for dark mode changes to update colors
  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;

    const updateColors = () => {
      const isDark = root.classList.contains("dark");
      const theme = themeColors[colorPalette];
      const colors = isDark ? theme.dark : theme.light;

      root.style.setProperty("--primary", colors.primary);
      root.style.setProperty("--primary-foreground", colors.primaryForeground);
      root.style.setProperty("--ring", colors.ring);

      if (root.style.getPropertyValue("--sidebar-primary")) {
        root.style.setProperty("--sidebar-primary", colors.primary);
        root.style.setProperty(
          "--sidebar-primary-foreground",
          colors.primaryForeground
        );
      }
    };

    const observer = new MutationObserver(updateColors);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Also listen for media query changes (system theme)
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = () => {
      // Small delay to let theme class update first
      setTimeout(updateColors, 10);
    };
    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, [colorPalette]);

  return {
    colorPalette,
    setColorPalette,
    colorPalettes: Object.entries(colorPalettes).map(([key, value]) => ({
      key: key as ColorPalette,
      ...value,
    })),
  };
}
