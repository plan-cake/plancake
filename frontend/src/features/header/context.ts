"use client";

import { createContext, useContext } from "react";

import { MotionValue } from "framer-motion";

export const HeaderSizeContext = createContext<{
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

export function useHeaderSize() {
  const context = useContext(HeaderSizeContext);
  if (!context) {
    throw new Error("useHeaderSize must be used within a HeaderSizeProvider");
  }
  return context;
}

export default HeaderSizeContext;
