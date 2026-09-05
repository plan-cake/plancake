"use client";

import { MonitorIcon, MoonIcon, SunIcon, SunMoonIcon } from "lucide-react";

import KebabMenu from "@/components/kebab-menu";
import SegmentedControl from "@/components/segmented-control";
import EmptyButton from "@/features/button/components/empty";
import ShrinkingHeaderButton from "@/features/header/components/buttons/shrinking-header";
import { useHeaderSize } from "@/features/header/context";
import { useThemeToggle } from "@/lib/hooks/use-theme-toggle";

export default function ThemePicker() {
  const { activeMenu, setActiveMenu } = useHeaderSize();
  const { theme = "system", toggleTheme } = useThemeToggle();

  const isMenuOpen = activeMenu === "theme";

  return (
    <ShrinkingHeaderButton
      buttonStyle="frosted glass inset"
      icon={<SunMoonIcon />}
    >
      <KebabMenu
        nested
        open={isMenuOpen}
        onOpenChange={(isOpen) => setActiveMenu(isOpen ? "theme" : null)}
        anchorPoint="top-center"
        trigger={
          <EmptyButton
            buttonStyle="frosted glass inset"
            icon={<SunMoonIcon />}
            aria-label="Choose Site Theme"
            tooltip="Theme"
          />
        }
        closeOnClick={false}
      >
        <div className="text-center font-bold">Theme</div>
        <SegmentedControl
          options={[
            {
              value: "system",
              label: <MonitorIcon />,
              ariaLabel: "Match System Theme",
            },
            { value: "light", label: <SunIcon />, ariaLabel: "Light Theme" },
            { value: "dark", label: <MoonIcon />, ariaLabel: "Dark Theme" },
          ]}
          value={theme}
          onChange={toggleTheme}
          className="frosted-glass-inset"
        />
        <div className="text-center text-sm opacity-75">
          {theme === "system"
            ? "Match System"
            : theme === "light"
              ? "Light"
              : "Dark"}
        </div>
      </KebabMenu>
    </ShrinkingHeaderButton>
  );
}
