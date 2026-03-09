"use client";

import { PlusIcon } from "@radix-ui/react-icons";
import { usePathname } from "next/navigation";

import ShrinkingHeaderButton from "@/components/header/shrinking-header-button";
import LinkButton from "@/features/button/components/link";
import { ButtonStyle } from "@/features/button/props";

export default function NewEventButton({
  isShrunk = false,
}: {
  isShrunk?: boolean;
}) {
  const pathname = usePathname();

  if (pathname === "/new-event") {
    return null;
  }

  let style: ButtonStyle = "frosted glass inset";

  if (pathname === "/dashboard" || pathname === "/") {
    style = "primary";
  }

  return (
    <ShrinkingHeaderButton
      buttonStyle={style}
      icon={<PlusIcon />}
      isShrunk={isShrunk}
    >
      <LinkButton
        buttonStyle={style}
        icon={<PlusIcon />}
        label="New Event"
        shrinkOnMobile
        href="/new-event"
      />
    </ShrinkingHeaderButton>
  );
}
