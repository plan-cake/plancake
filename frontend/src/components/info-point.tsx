import { CircleQuestionMarkIcon } from "lucide-react";

import Tooltip from "@/features/system-feedback/tooltip/base";

export default function InfoPoint({
  tooltipSide = "top",
  content,
  className,
}: {
  tooltipSide?: "top" | "bottom";
  content: React.ReactNode;
  className?: string;
}) {
  return (
    <Tooltip side={tooltipSide} content={content}>
      <CircleQuestionMarkIcon className={className} />
    </Tooltip>
  );
}
