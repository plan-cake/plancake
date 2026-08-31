import { useState } from "react";

import { CircleQuestionMarkIcon } from "lucide-react";

import { FloatingDrawer } from "@/features/drawer";
import Tooltip, { TooltipSide } from "@/features/system-feedback/tooltip/base";
import usePointerType from "@/lib/hooks/use-pointer-type";

type InfoPointProps = {
  /**
   * The side the tooltip should appear on when hovering.
   *
   * @default "top"
   */
  tooltipSide?: TooltipSide;
  /**
   * The title displayed on the drawer when tapping the info point on mobile.
   */
  title: string;
  /**
   * Hidden description for use with screen readers.
   */
  description: string;
  /**
   * The content to be displayed on desktop when hovering the info point.
   */
  tooltipContent: React.ReactNode;
  /**
   * The content to be displayed on mobile when tapping the info point.
   */
  drawerContent: React.ReactNode;
  /**
   * Optional styling for the info point icon. Does not affect the content in the tooltip
   * or drawer.
   */
  className?: string;
};

export default function InfoPoint({
  tooltipSide = "top",
  title,
  description,
  tooltipContent,
  drawerContent,
  className,
}: InfoPointProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pointerType = usePointerType();

  return (
    <>
      <Tooltip side={tooltipSide} content={tooltipContent}>
        <button
          onClick={() => setDrawerOpen(pointerType === "coarse")}
          aria-label={description}
        >
          <CircleQuestionMarkIcon className={className} />
        </button>
      </Tooltip>
      <FloatingDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={title}
        description={description}
      >
        {drawerContent}
      </FloatingDrawer>
    </>
  );
}
