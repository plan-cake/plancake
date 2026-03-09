import { DashboardIcon } from "@radix-ui/react-icons";

import LinkButton from "@/features/button/components/link";
import ShrinkingHeaderButton from "@/features/header/components/shrinking-header-button";

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
