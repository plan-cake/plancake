"use client";

import { createContext, useContext } from "react";

import { MotionValue } from "framer-motion";

export const HeaderContext = createContext<{
  isFullSize: boolean;
  shrinkAmount: MotionValue;
  expand: () => void;
  activeMenu: string | null;
  setActiveMenu: (menu: string | null) => void;
}>({
  isFullSize: true,
  shrinkAmount: new MotionValue(0),
  expand: () => {},
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
