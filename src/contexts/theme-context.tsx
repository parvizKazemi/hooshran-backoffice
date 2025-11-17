import { useColorPalette } from "@/hooks/use-color-palette";

//TODO: update later to use the theme context
export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // load the theme from the local storage
  useColorPalette();

  return <>{children}</>;
}
