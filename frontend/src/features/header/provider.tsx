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

  const shrink = useCallback(() => {
    setIsShrunk(true);
  }, []);

  const expand = useCallback(() => {
    setIsShrunk(false);
  }, []);

  const heightClass: HeaderHeightClass = isShrunk ? "h-12" : "h-25";
  const topMarginClass: HeaderMarginClass = isShrunk ? "top-12" : "top-25";

  return (
    <HeaderSizeContext.Provider
      value={{
        isShrunk,
        heightClass,
        topMarginClass,
        shrink,
        expand,
      }}
    >
      {children}
    </HeaderSizeContext.Provider>
  );
}
