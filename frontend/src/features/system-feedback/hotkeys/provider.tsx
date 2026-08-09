"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useHotkeys, useHotkeysContext } from "react-hotkeys-hook";

import { SHORTCUT_MODE_SCOPE } from "@/features/system-feedback/hotkeys/constants";
import ShortcutsContext from "@/features/system-feedback/hotkeys/context";
import { isAppleOs } from "@/lib/utils/is-apple-os";

export function ShortcutsProvider({ children }: { children: React.ReactNode }) {
  // Shortcut mode toggle
  const lastFocus = useRef<HTMLElement | null>(null);
  const { disableScope, toggleScope, activeScopes } = useHotkeysContext();
  const endShortcutMode = useCallback(
    (returnFocus: boolean) => {
      if (returnFocus && lastFocus.current) {
        lastFocus.current.focus();
      }
      lastFocus.current = null;
      disableScope(SHORTCUT_MODE_SCOPE);
    },
    [disableScope],
  );
  useHotkeys(
    "mod+k",
    () => {
      // remove focus from any elements
      const activeElement = document.activeElement as HTMLElement | null;
      if (activeElement) {
        lastFocus.current = activeElement;
        activeElement.blur();
      }

      toggleScope(SHORTCUT_MODE_SCOPE);
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
      preventDefault: true,
    },
  );
  useHotkeys(
    "esc",
    () => {
      endShortcutMode(true);
    },
    {
      enableOnContentEditable: true,
      preventDefault: true,
      scopes: [SHORTCUT_MODE_SCOPE],
    },
  );
  useEffect(() => {
    // also cancel shortcut mode if the user clicks anywhere
    const handleClickCancel = (e: MouseEvent) => {
      if (!activeScopes.includes(SHORTCUT_MODE_SCOPE)) return;

      const target = e.target as HTMLElement;
      const isInteractive = !!target.closest(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
      );

      endShortcutMode(!isInteractive);
    };
    window.addEventListener("click", handleClickCancel);
    return () => {
      window.removeEventListener("click", handleClickCancel);
    };
  }, [activeScopes, endShortcutMode]);

  // Key press tracking
  const [pressedModifiers, setPressedModifiers] = useState<{
    mod: boolean;
    shift: boolean;
    alt: boolean;
  }>({ mod: false, shift: false, alt: false });
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const keyTimeouts = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const normalize = (e: KeyboardEvent) => [
      e.key.toLowerCase(),
      e.code.toLowerCase(),
      e.code.toLowerCase().replace("key", ""),
      e.code.toLowerCase().replace("digit", ""),
    ];

    const handleKeyEvent = (e: KeyboardEvent, isDown: boolean) => {
      const activeElement = document.activeElement as HTMLElement | null;
      const isTyping =
        activeElement &&
        (["INPUT", "TEXTAREA", "SELECT"].includes(activeElement.tagName) ||
          activeElement?.isContentEditable);
      if (isDown && isTyping) return;

      setPressedModifiers({
        mod: isAppleOs() ? e.metaKey : e.ctrlKey,
        shift: e.shiftKey,
        alt: e.altKey,
      });

      const keys = normalize(e);
      keys.forEach((k) => {
        // Clear existing timeout
        if (keyTimeouts.current.has(k)) {
          clearTimeout(keyTimeouts.current.get(k));
          keyTimeouts.current.delete(k);
        }

        if (!isDown) return;
        // Set new timeout
        const timeout = setTimeout(() => {
          setPressedKeys((prev) => {
            const next = new Set(prev);
            next.delete(k);
            return next;
          });
          keyTimeouts.current.delete(k);
        }, 300);
        keyTimeouts.current.set(k, timeout);
      });

      if (isDown) {
        setPressedKeys((prev) => new Set([...prev, ...keys]));
      } else {
        setPressedKeys((prev) => {
          const newSet = new Set([...prev]);
          for (const key of keys) {
            newSet.delete(key);
          }
          return newSet;
        });
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => handleKeyEvent(e, true);
    const handleKeyUp = (e: KeyboardEvent) => handleKeyEvent(e, false);

    const handleBlur = () => {
      setPressedModifiers({ mod: false, shift: false, alt: false });
      setPressedKeys(new Set());
      for (const timeout of keyTimeouts.current.values()) {
        clearTimeout(timeout);
      }
      keyTimeouts.current.clear();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    const timeouts = keyTimeouts.current;

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      for (const timeout of timeouts.values()) {
        clearTimeout(timeout);
      }
      timeouts.clear();
    };
  }, []);

  const checkKeyPressed = (hotkey: string) => {
    const isModifier = ["mod", "shift", "alt"].includes(hotkey);

    if (isModifier) {
      return pressedModifiers[hotkey as keyof typeof pressedModifiers];
    } else {
      return pressedKeys.has(hotkey);
    }
  };

  return (
    <ShortcutsContext.Provider
      value={{
        shortcutMode: activeScopes.includes(SHORTCUT_MODE_SCOPE),
        endShortcutMode,
        checkKeyPressed,
      }}
    >
      {children}
    </ShortcutsContext.Provider>
  );
}
