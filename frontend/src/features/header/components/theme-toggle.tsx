"use client";

import { MonitorIcon, MoonIcon, SunIcon, SunMoonIcon } from "lucide-react";
import { useTheme } from "next-themes";

import KebabMenu from "@/components/kebab-menu";
import SegmentedControl from "@/components/segmented-control";
import EmptyButton from "@/features/button/components/empty";
import ShrinkingHeaderButton from "@/features/header/components/shrinking-header-button";

export default function ThemeToggle() {
  const { theme = "system", setTheme } = useTheme();

  return (
    <ShrinkingHeaderButton
      buttonStyle="frosted glass inset"
      icon={<SunMoonIcon />}
    >
      <KebabMenu
        trigger={
          <EmptyButton
            buttonStyle="frosted glass inset"
            icon={<SunMoonIcon />}
          />
        }
      >
        <SegmentedControl
          options={[
            { value: "system", label: <MonitorIcon /> },
            { value: "light", label: <SunIcon /> },
            { value: "dark", label: <MoonIcon /> },
          ]}
          value={theme}
          onChange={setTheme}
          className="frosted-glass-inset"
        />
      </KebabMenu>
    </ShrinkingHeaderButton>
  );
}
