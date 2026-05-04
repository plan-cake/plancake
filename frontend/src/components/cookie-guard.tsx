"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils/classname";

export function CookieGuard({ children }: { children: React.ReactNode }) {
  const [cookiesEnabled, setCookiesEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const testKey = "plancake_test";
    try {
      document.cookie = `${testKey}=1; SameSite=Lax`;
      const exists = document.cookie
        .split(";")
        .some((item) => item.trim().startsWith(`${testKey}=`));
      document.cookie = `${testKey}=; Max-Age=0; SameSite=Lax`;
      setCookiesEnabled(exists);
    } catch {
      setCookiesEnabled(false);
    }
  }, []);

  if (cookiesEnabled === false) {
    return (
      <div
        className={cn(
          "flex h-screen w-full flex-col items-center justify-center text-center",
          "bg-background gap-2 p-4",
        )}
      >
        <h1 className="text-2xl font-bold">Cookies Required</h1>
        <p className="text-foreground">
          Plancake requires cookies for the site to work properly. Please
          enable/unblock them in your browser settings and refresh.
        </p>
      </div>
    );
  }

  // Still checking or enabled
  return <>{children}</>;
}
