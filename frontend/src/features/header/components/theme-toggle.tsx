"use client";

import { useTheme } from "next-themes";
import { FiMoon, FiSun } from "react-icons/fi";

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
      icon={resolvedTheme === "dark" ? <FiMoon /> : <FiSun />}
    >
      <ActionButton
        buttonStyle="frosted glass inset"
        icon={resolvedTheme === "dark" ? <FiMoon /> : <FiSun />}
        onClick={toggleTheme}
      />
    </ShrinkingHeaderButton>
  );
}
