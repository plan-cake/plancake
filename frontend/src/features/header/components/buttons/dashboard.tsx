import { LayoutDashboardIcon } from "lucide-react";

import LinkButton from "@/features/button/components/link";

export default function DashboardButton() {
  return (
    <LinkButton
      buttonStyle="frosted glass inset"
      icon={<LayoutDashboardIcon className="h-5 w-5" />}
      href="/dashboard"
      tooltip="Dashboard"
    />
  );
}
