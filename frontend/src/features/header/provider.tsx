"use client";

import { useCallback, useState } from "react";

import { HeaderSizeContext } from "@/features/header/context";
import { HeaderHeightClass, HeaderMarginClass } from "@/features/header/type";

export default function HeaderSizeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isShrunk, setIsShrunk] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const shrink = useCallback(() => {
    setIsShrunk(true);
    setActiveMenu(null);
  }, []);

  const expand = useCallback(() => {
    setIsShrunk(false);
  }, []);

  const heightClass: HeaderHeightClass = isShrunk
    ? "header-transition-[height] h-14"
    : "header-transition-[height] h-23";
  const topMarginClass: HeaderMarginClass = isShrunk
    ? "header-transition-[top] top-14"
    : "header-transition-[top] top-23";

  return (
    <HeaderSizeContext.Provider
      value={{
        isShrunk,
        heightClass,
        topMarginClass,
        shrink,
        expand,
        activeMenu,
        setActiveMenu,
      }}
    >
      {children}
    </HeaderSizeContext.Provider>
  );
}
