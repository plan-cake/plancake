"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { animate, motion } from "framer-motion";

import { cn } from "@/lib/utils/classname";

const FADE_WIDTH = "2rem" as const;
const DOT_TRANSITION = { type: "spring", stiffness: 300, damping: 30 } as const;

export default function PageDots({
  count,
  activeIndex,
  onSelect,
  itemLabel = "page",
}: {
  count: number;
  activeIndex: number;
  onSelect: (index: number) => void;
  itemLabel?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Manage fade appearance state based on scroll
  const [fadeLeft, setFadeLeft] = useState(false);
  const [fadeRight, setFadeRight] = useState(false);
  const updateFade = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setFadeLeft(scrollLeft > 1);
    setFadeRight(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  // Update fade state if the container resizes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(updateFade);
    observer.observe(container);
    return () => observer.disconnect();
  }, [updateFade]);

  // Scroll the active dot to the center
  useEffect(() => {
    const container = containerRef.current;
    const dot = container?.firstElementChild?.children[activeIndex];
    if (!container || !(dot instanceof HTMLElement)) return;

    updateFade();

    // Clamped so the spring never aims past either end of the row
    const centered =
      dot.offsetLeft - (container.clientWidth - dot.offsetWidth) / 2;
    const maxScroll = container.scrollWidth - container.clientWidth;
    const target = Math.max(0, Math.min(centered, maxScroll));

    // Same spring as the dots
    const animation = animate(container.scrollLeft, target, {
      ...DOT_TRANSITION,
      onUpdate: (value) => {
        container.scrollLeft = value;
      },
    });
    return () => animation.stop();
  }, [activeIndex, count, updateFade]);

  const mask = useMemo(() => {
    if (!fadeLeft && !fadeRight) return undefined;
    const start = fadeLeft ? `transparent, black ${FADE_WIDTH}` : "black";
    const end = fadeRight
      ? `black calc(100% - ${FADE_WIDTH}), transparent`
      : "black";
    return `linear-gradient(to right, ${start}, ${end})`;
  }, [fadeLeft, fadeRight]);

  return (
    <motion.div
      layoutScroll
      ref={containerRef}
      onScroll={updateFade}
      style={{ maskImage: mask, WebkitMaskImage: mask }}
      className={cn(
        "relative min-w-0 max-w-full overflow-x-auto overflow-y-hidden",
        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
      )}
    >
      <div className="flex w-max items-center gap-2">
        {Array.from({ length: count }).map((_, index) => {
          const isActive = activeIndex === index;
          return (
            <button
              key={index}
              onClick={() => onSelect(index)}
              aria-label={`Go to ${itemLabel} ${index + 1}`}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex h-4 items-center justify-center",
                !isActive && "cursor-pointer",
              )}
              disabled={isActive}
            >
              <motion.div
                layout
                transition={DOT_TRANSITION}
                className={cn(
                  "h-2 rounded-full",
                  isActive
                    ? "bg-foreground w-6"
                    : "bg-foreground/20 hover:bg-foreground/40 w-2",
                )}
              />
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
