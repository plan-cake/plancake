import { useEffect, useState } from "react";

import { CircleQuestionMarkIcon } from "lucide-react";

import { FloatingDrawer } from "@/features/drawer";
import Tooltip, { TooltipSide } from "@/features/system-feedback/tooltip/base";

export default function InfoPoint({
  tooltipSide = "top",
  drawerTitle,
  drawerDescription,
  tooltipContent,
  drawerContent,
  className,
}: {
  tooltipSide?: TooltipSide;
  drawerTitle: string;
  drawerDescription: string;
  tooltipContent: React.ReactNode;
  drawerContent: React.ReactNode;
  className?: string;
}) {
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
