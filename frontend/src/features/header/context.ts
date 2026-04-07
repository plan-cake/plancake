"use client";

import { createContext, useContext } from "react";

import { HeaderHeightClass, HeaderMarginClass } from "@/features/header/type";

export const HeaderSizeContext = createContext<{
  isShrunk: boolean;
  heightClass: HeaderHeightClass;
  topMarginClass: HeaderMarginClass;
  shrink: () => void;
  expand: () => void;
  activeMenu: string | null;
  setActiveMenu: (menu: string | null) => void;
}>({
  isShrunk: false,
  heightClass: "header-transition-[height] h-23",
  topMarginClass: "header-transition-[top] top-23",
  shrink: () => {},
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
