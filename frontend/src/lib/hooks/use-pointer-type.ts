"use client";

import { useEffect, useState } from "react";

type PointerType = "coarse" | "fine";

export default function usePointerType() {
  /**
   * This initial null state is used to give the option to render a fallback/placeholder
   * before the actual pointer type is determined.
   */
  const [pointerType, setPointerType] = useState<PointerType | null>(null);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: coarse)");
    setPointerType(mediaQuery.matches ? "coarse" : "fine");

    const listener = (e: MediaQueryListEvent) =>
      setPointerType(e.matches ? "coarse" : "fine");
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  return pointerType;
}
