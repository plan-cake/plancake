"use client";

import { createContext, useContext } from "react";

export const HeaderContext = createContext<{
  activeMenu: string | null;
  setActiveMenu: (menu: string | null) => void;
}>({
  activeMenu: null,
  setActiveMenu: () => {},
});

export function useHeader() {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error("useHeader must be used within a HeaderProvider");
  }
  return context;
}

export default HeaderContext;
