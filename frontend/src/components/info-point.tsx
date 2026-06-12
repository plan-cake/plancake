import { useEffect, useState } from "react";

import { CircleQuestionMarkIcon } from "lucide-react";

import { FloatingDrawer } from "@/features/drawer";
import Tooltip, { TooltipSide } from "@/features/system-feedback/tooltip/base";

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
  drawerTitle: string;
  /**
   * Hidden description for the drawer shown on mobile, to aid with accessibility.
   */
  drawerDescription: string;
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
  drawerTitle,
  drawerDescription,
  tooltipContent,
  drawerContent,
  className,
}: InfoPointProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: coarse)");
    setIsTouchDevice(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setIsTouchDevice(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  return (
    <>
      <Tooltip side={tooltipSide} content={tooltipContent}>
        <CircleQuestionMarkIcon
          className={className}
          onClick={() => setDrawerOpen(isTouchDevice)}
        />
      </Tooltip>
      <FloatingDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={drawerTitle}
        description={drawerDescription}
      >
        {drawerContent}
      </FloatingDrawer>
    </>
  );
}
