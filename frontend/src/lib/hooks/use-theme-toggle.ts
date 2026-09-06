import { useTheme } from "next-themes";

export function useThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const toggleTheme = (newTheme: string) => {
    let targetTheme = newTheme;

    if (newTheme === "system") {
      targetTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    if (targetTheme === resolvedTheme) {
      setTheme(newTheme);
      return;
    }

    if (!document.startViewTransition) {
      setTheme(newTheme);
    } else {
      document.startViewTransition(() => {
        setTheme(newTheme);
      });
    }
  };

  return { theme, toggleTheme };
}
