import { useEffect, useState } from "react";

import { CircleQuestionMarkIcon } from "lucide-react";

import { FloatingDrawer } from "@/features/drawer";
import Tooltip from "@/features/system-feedback/tooltip/base";

export default function InfoPoint({
  tooltipSide = "top",
  title,
  description,
  content,
  className,
}: {
  tooltipSide?: "top" | "bottom";
  title: string;
  description: string;
  content: React.ReactNode;
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
      <Tooltip side={tooltipSide} content={content}>
        <CircleQuestionMarkIcon
          className={className}
          onClick={() => setDrawerOpen(isTouchDevice)}
        />
      </Tooltip>
      <FloatingDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={title}
        description={description}
      >
        {content}
      </FloatingDrawer>
    </>
  );
}
