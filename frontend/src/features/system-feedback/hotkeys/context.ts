import { createContext, useContext } from "react";

type KeyPressedCallback = (hotkey: string) => boolean;

export const PressedKeysContext = createContext<KeyPressedCallback | null>(
  null,
);

export function usePressedKeys() {
  const context = useContext(PressedKeysContext);
  if (!context) {
    throw new Error("usePressedKeys must be used within a PressedKeysProvider");
  }
  return context;
}

export default PressedKeysContext;
