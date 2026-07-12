"use client";

import { useEffect, useState } from "react";

type PointerType = "coarse" | "fine";

export default function usePointerType() {
  const [pointerType, setPointerType] = useState<PointerType>();
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
