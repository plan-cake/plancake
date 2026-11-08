"use client";

import { useEffect, useState } from "react";

import { HeaderContext } from "@/features/header/context";

export default function HeaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    if (!activeMenu) return;

    const closeMenu = () => setActiveMenu(null);
    window.addEventListener("scroll", closeMenu, { passive: true, once: true });
    return () => window.removeEventListener("scroll", closeMenu);
  }, [activeMenu]);

  return (
    <HeaderContext.Provider
      value={{
        activeMenu,
        setActiveMenu,
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
}
