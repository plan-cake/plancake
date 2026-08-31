"use client";

import { useState } from "react";

import { ShareIcon } from "lucide-react";

import ShareMenu from "@/features/share-menu/menu";
import { cn } from "@/lib/utils/classname";

export type DashboardShareButtonProps = {
  title: string;
  code: string;
};

export default function DashboardShareButton({
  title,
  code,
}: DashboardShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ShareMenu
      trigger={
        <button
          onClick={(e) => {
            e.preventDefault(); // prevent the link behind it triggering
            setIsOpen(true);
          }}
          className={cn(
            "flex cursor-pointer items-center gap-0.5 rounded-full px-2 py-1.5",
            "border-foreground hover:bg-foreground/20 active:bg-foreground/10 border",
          )}
        >
          <ShareIcon className="h-4 w-4" />
          <span className="ml-1 text-xs">Share</span>
        </button>
      }
      eventTitle={title}
      eventCode={code}
      open={isOpen}
      onOpenChange={setIsOpen}
    />
  );
}
