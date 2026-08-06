import { useEffect, useRef, useState } from "react";

import { useHotkeys, useHotkeysContext } from "react-hotkeys-hook";

import { SHORTCUT_MODE_SCOPE } from "@/features/system-feedback/hotkeys/constants";
import ShortcutsContext from "@/features/system-feedback/hotkeys/context";
import { isAppleOs } from "@/lib/utils/is-apple-os";

export function ShortcutsProvider({ children }: { children: React.ReactNode }) {
  // Shortcut mode toggle
  const { toggleScope, activeScopes } = useHotkeysContext();
  const endShortcutMode = () => {
    if (activeScopes.includes(SHORTCUT_MODE_SCOPE)) {
      toggleScope(SHORTCUT_MODE_SCOPE);
    }
  };
  useHotkeys(
    "mod+k",
    () => {
      // remove focus from any input elements
      const activeElement = document.activeElement as HTMLElement | null;
      if (
        activeElement &&
        (["INPUT", "TEXTAREA", "SELECT"].includes(activeElement.tagName) ||
          activeElement?.isContentEditable)
      ) {
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
      endShortcutMode();
    },
    {
      enableOnContentEditable: true,
      preventDefault: true,
      scopes: [SHORTCUT_MODE_SCOPE],
    },
  );
  useEffect(() => {
    // also cancel shortcut mode if the user clicks anywhere
    const handleClick = () => {
      if (activeScopes.includes(SHORTCUT_MODE_SCOPE)) {
        toggleScope(SHORTCUT_MODE_SCOPE);
      }
    };
    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [activeScopes, toggleScope]);

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
