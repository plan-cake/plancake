"use client";

import { AnimatePresence, motion } from "framer-motion";

import HotkeyBadge from "@/features/system-feedback/hotkeys/components/hotkey-badge";
import { useShortcuts } from "@/features/system-feedback/hotkeys/context";
import { cn } from "@/lib/utils/classname";

export default function ShortcutModeIndicator() {
  const { shortcutMode } = useShortcuts();

  return (
    <AnimatePresence>
      {shortcutMode && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "fixed bottom-4 left-1/2 z-[500] -translate-x-1/2",
            "bg-panel border-accent rounded-full border-2 px-4 py-2 text-center",
          )}
        >
          <span className="text-accent">Shortcut Mode Active</span>
          <div className="flex items-center gap-1 text-sm opacity-75">
            Press <HotkeyBadge hotkey="esc" keyClassName="scale-85" /> or click
            anywhere to exit.
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
