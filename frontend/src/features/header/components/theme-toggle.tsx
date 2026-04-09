"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import ActionButton from "@/features/button/components/action";
import ShrinkingHeaderButton from "@/features/header/components/shrinking-header-button";

export default function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <ShrinkingHeaderButton
      buttonStyle="frosted glass inset"
      icon={resolvedTheme === "dark" ? <MoonIcon /> : <SunIcon />}
    >
      <ActionButton
        buttonStyle="frosted glass inset"
        icon={resolvedTheme === "dark" ? <MoonIcon /> : <SunIcon />}
        onClick={toggleTheme}
      />
    </ShrinkingHeaderButton>
  );
}
