import { DashboardIcon } from "@radix-ui/react-icons";

import ShrinkingHeaderButton from "@/components/header/shrinking-header-button";
import LinkButton from "@/features/button/components/link";

export default function DashboardButton({
  isShrunk = false,
}: {
  isShrunk?: boolean;
}) {
  return (
    <ShrinkingHeaderButton
      buttonStyle="frosted glass inset"
      icon={<DashboardIcon />}
      isShrunk={isShrunk}
    >
      <LinkButton
        buttonStyle="frosted glass inset"
        icon={<DashboardIcon className="h-5 w-5" />}
        href="/dashboard"
      />
    </ShrinkingHeaderButton>
  );
}
