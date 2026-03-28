"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import LinkText from "@/components/link-text";
import Logo from "@/components/logo";
import { getCurrentVersion } from "@/features/version-history/data";
import { cn } from "@/lib/utils/classname";

export default function LogoArea({ isShrunk = false }: { isShrunk?: boolean }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div>
      {/* Text Container */}
      <Link href="/">
        <Logo oneLine={isShrunk} />
      </Link>
      <Link
        href="/version-history"
        className={cn(
          "header-transition-[opacity] text-xs",
          isShrunk ? "opacity-0" : "opacity-100",
        )}
      >
        <LinkText unbolded>{getCurrentVersion()}</LinkText>
      </Link>
    </div>
  );
}
