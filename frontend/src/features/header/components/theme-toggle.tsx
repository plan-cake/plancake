"use client";

import { useTheme } from "next-themes";
import { FiMoon, FiSun } from "react-icons/fi";

import ActionButton from "@/features/button/components/action";
import ShrinkingHeaderButton from "@/features/header/components/shrinking-header-button";

export default function FixedThemeToggle({
  isShrunk = false,
}: {
  isShrunk?: boolean;
}) {
  const { setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
    return true;
  };

  return (
    <ShrinkingHeaderButton
      buttonStyle="frosted glass inset"
      icon={resolvedTheme === "dark" ? <FiMoon /> : <FiSun />}
      isShrunk={isShrunk}
    >
      <ActionButton
        buttonStyle="frosted glass inset"
        icon={resolvedTheme === "dark" ? <FiMoon /> : <FiSun />}
        onClick={toggleTheme}
      />
    </ShrinkingHeaderButton>
  );
}
