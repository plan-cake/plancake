"use client";

import { usePathname } from "next/navigation";

import LinkButton from "@/features/button/components/link";
import ShrinkingHeaderButton from "@/features/header/components/buttons/shrinking-header";

export default function LoginButton() {
  const pathname = usePathname();
  const callbackUrl = encodeURIComponent(pathname);

  return (
    <ShrinkingHeaderButton buttonStyle="frosted glass inset" label="Log In">
      <LinkButton
        className="relative z-10"
        buttonStyle="frosted glass inset"
        label="Log In"
        href={`/login?callbackUrl=${callbackUrl}`}
      />
    </ShrinkingHeaderButton>
  );
}
