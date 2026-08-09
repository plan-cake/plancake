"use client";

import { useEffect, useRef, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { ZapIcon } from "lucide-react";

import HotkeyBadge from "@/features/system-feedback/hotkeys/components/hotkey-badge";
import { useShortcuts } from "@/features/system-feedback/hotkeys/context";
import { cn } from "@/lib/utils/classname";

export default function ShortcutModeIndicator() {
  const { shortcutMode } = useShortcuts();
  const [subtextVisible, setSubtextVisible] = useState(false);
  const subtextTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (shortcutMode) {
      subtextTimeout.current = setTimeout(() => {
        setSubtextVisible(true);
      }, 2000);
    } else {
      setSubtextVisible(false);
    }

    return () => {
      if (subtextTimeout.current) {
        clearTimeout(subtextTimeout.current);
        subtextTimeout.current = null;
      }
    };
  }, [shortcutMode]);

  return (
    <AnimatePresence>
      {shortcutMode && (
        <motion.div
          initial={{ opacity: 0, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 2 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "fixed bottom-4 left-1/2 z-[500] -translate-x-1/2",
            "bg-panel border-accent rounded-full border-2",
            "flex flex-col items-center px-4 py-2 text-center",
          )}
        >
          <span className="text-accent flex items-center gap-1 font-bold">
            <ZapIcon className="h-5 w-5" strokeWidth={2} />
            Shortcut Mode
          </span>
          {subtextVisible && (
            <motion.div
              initial={{ opacity: 0, height: 0, width: 100 }}
              animate={{ opacity: 1, height: "auto", width: "auto" }}
              transition={{
                duration: 0.3,
                ease: "circInOut",
                opacity: { delay: 0.3 },
              }}
              className="flex flex-col items-center"
            >
              <div className="flex flex-nowrap items-center gap-1 overflow-hidden text-nowrap text-sm opacity-75">
                Trigger an action with one of the displayed keys.
              </div>
              <div className="flex flex-nowrap items-center gap-1 overflow-hidden text-nowrap text-sm opacity-75">
                Press <HotkeyBadge hotkey="esc" keyClassName="text-xs p-0.5" />{" "}
                or click anywhere to exit.
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
