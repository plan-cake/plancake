"use client";

import ActionButton from "@/features/button/components/action";
import { cn } from "@/lib/utils/classname";

export default function SkipToContentButton() {
  const handleClick = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      mainContent.setAttribute("tabindex", "-1");
      mainContent.focus();
    }
  };

  return (
    <ActionButton
      buttonStyle="frosted glass"
      label="Skip to Content"
      aria-label="Skip to main content"
      className={cn(
        "z-200 fixed m-2 w-fit",
        "left-1/2 top-0 -translate-x-1/2",
        "transition-transform duration-300 ease-in-out",
        "translate-y-[-150%] group-focus:translate-y-[0%]",
      )}
      onClick={handleClick}
    />
  );
}
