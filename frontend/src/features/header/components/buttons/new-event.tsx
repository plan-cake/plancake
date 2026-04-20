import { PlusIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import LinkButton from "@/features/button/components/link";
import { ButtonStyle } from "@/features/button/props";
import ShrinkingHeaderButton from "@/features/header/components/buttons/shrinking-header";

export default function NewEventButton() {
  const pathname = usePathname();

  if (pathname === "/new-event") {
    return null;
  }

  let style: ButtonStyle = "frosted glass inset";

  if (pathname === "/dashboard" || pathname === "/") {
    style = "primary";
  }

  return (
    <ShrinkingHeaderButton buttonStyle={style} icon={<PlusIcon />}>
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
