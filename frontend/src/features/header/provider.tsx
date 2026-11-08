"use client";

import { useState } from "react";

import { HeaderContext } from "@/features/header/context";

export default function HeaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

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
