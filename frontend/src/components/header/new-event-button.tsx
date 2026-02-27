"use client";

import { PlusIcon } from "@radix-ui/react-icons";
import { usePathname } from "next/navigation";

import LinkButton from "@/features/button/components/link";
import { ButtonStyle } from "@/features/button/props";

export default function NewEventButton() {
  const pathname = usePathname();

  if (pathname === "/new-event") {
    return null;
  }

  let style: ButtonStyle = "secondary";

  if (pathname === "/dashboard" || pathname === "/") {
    style = "primary";
  }

  return (
    <LinkButton
      buttonStyle={style}
      icon={<PlusIcon />}
      label="New Event"
      shrinkOnMobile
      href="/new-event"
    />
  );
}
