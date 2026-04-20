import { LayoutDashboardIcon } from "lucide-react";

import LinkButton from "@/features/button/components/link";
import ShrinkingHeaderButton from "@/features/header/components/buttons/shrinking-header";

export default function DashboardButton() {
  return (
    <ShrinkingHeaderButton
      buttonStyle="frosted glass inset"
      icon={<LayoutDashboardIcon />}
    >
      <LinkButton
        buttonStyle="frosted glass inset"
        icon={<LayoutDashboardIcon className="h-5 w-5" />}
        href="/dashboard"
      />
    </ShrinkingHeaderButton>
  );
}
