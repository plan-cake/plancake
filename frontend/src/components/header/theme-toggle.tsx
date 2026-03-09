"use client";

import { useTheme } from "next-themes";
import { FiMoon, FiSun } from "react-icons/fi";

import ShrinkingHeaderButton from "@/components/header/shrinking-header-button";
import ActionButton from "@/features/button/components/action";

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
