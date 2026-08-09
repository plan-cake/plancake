"use client";

import { TooltipProvider } from "@radix-ui/react-tooltip";
import { LucideProvider } from "lucide-react";
import { ThemeProvider } from "next-themes";
import { HotkeysProvider } from "react-hotkeys-hook";

import HeaderSizeProvider from "@/features/header/provider";
import { ToastProvider } from "@/features/system-feedback";
import { ShortcutsProvider } from "@/features/system-feedback/hotkeys/provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LucideProvider absoluteStrokeWidth={true} strokeWidth={1.5}>
        <HeaderSizeProvider>
          <ToastProvider>
            <HotkeysProvider initiallyActiveScopes={[]}>
              <ShortcutsProvider>
                <TooltipProvider delayDuration={300} skipDelayDuration={500}>
                  {children}
                </TooltipProvider>
              </ShortcutsProvider>
            </HotkeysProvider>
          </ToastProvider>
        </HeaderSizeProvider>
      </LucideProvider>
    </ThemeProvider>
  );
}
