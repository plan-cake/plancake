import { createContext, useContext } from "react";

type ShortcutsContextValue = {
  shortcutMode: boolean;
  endShortcutMode: (returnFocus: boolean) => void;
  checkKeyPressed: (hotkey: string) => boolean;
};

export const ShortcutsContext = createContext<ShortcutsContextValue | null>(
  null,
);

export function useShortcuts() {
  const context = useContext(ShortcutsContext);
  if (!context) {
    throw new Error("useShortcuts must be used within a ShortcutsProvider");
  }
  return context;
}

export default ShortcutsContext;
