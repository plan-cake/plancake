"use client";

import { MonitorIcon, MoonIcon, SunIcon, SunMoonIcon } from "lucide-react";
import { useTheme } from "next-themes";

import KebabMenu from "@/components/kebab-menu";
import SegmentedControl from "@/components/segmented-control";
import EmptyButton from "@/features/button/components/empty";
import ShrinkingHeaderButton from "@/features/header/components/shrinking-header-button";
import { useHeaderSize } from "@/features/header/context";

export default function ThemeToggle() {
  const { activeMenu, setActiveMenu } = useHeaderSize();
  const { theme = "system", setTheme } = useTheme();

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
          />
        }
        closeOnClick={false}
      >
        <div className="text-center font-bold">Theme</div>
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
