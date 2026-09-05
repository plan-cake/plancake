"use client";

import { useRef, useState } from "react";

import { cn } from "@/lib/utils/classname";

const BASE_FONT_PX = 16;
const MIN_FONT_PX = 12;

interface OrbitNodeProps {
  stepNumber: number;
  label: string;
  hoverCard: React.ReactNode;
  onSelect: () => void;
  orbitScale: number | null;
  openAbove?: boolean;
}

export default function OrbitNode({
  stepNumber,
  label,
  hoverCard,
  onSelect,
  orbitScale,
  openAbove = false,
}: OrbitNodeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [opensLeft, setOpensLeft] = useState(false);

  const handleMouseEnter = () => {
    if (openAbove) return;
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.right + 576 + 20 > window.innerWidth) {
        setOpensLeft(true);
      } else {
        setOpensLeft(false);
      }
    }
  };

  const counterScale =
    orbitScale && orbitScale > 0
      ? Math.max(1, MIN_FONT_PX / (BASE_FONT_PX * orbitScale))
      : 1;

  return (
    <div
      ref={containerRef}
      className="group relative flex items-center justify-center"
      onMouseEnter={handleMouseEnter}
    >
      <button
        onClick={() => {
          if (!window.matchMedia("(hover: hover)").matches) {
            onSelect();
          }
        }}
        style={
          counterScale !== 1
            ? { transform: `scale(${counterScale})`, transformOrigin: "center" }
            : undefined
        }
        className={cn(
          "bg-lion hover:ring-10 hover:ring-bone/50 text-violet hover:cursor-pointer",
          "flex items-center gap-2 whitespace-nowrap rounded-full px-2 py-2 pr-3 font-semibold",
          "hover:cursor-pointer",
        )}
      >
        <div
          className={cn(
            "bg-accent text-base font-bold text-white",
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          )}
        >
          {stepNumber}
        </div>
        {label}
      </button>

      <div
        className={cn(
          "w-xl pointer-events-none absolute opacity-0 transition-all duration-300 ease-out hover:z-50 group-hover:pointer-events-auto group-hover:opacity-100",
          openAbove
            ? "bottom-[110%] left-1/2 origin-bottom -translate-x-1/2 scale-95 group-hover:scale-100"
            : cn(
                "top-1/2 -translate-y-1/2",
                opensLeft
                  ? "right-[110%] origin-right scale-95 group-hover:scale-100"
                  : "left-[110%] origin-left scale-95 group-hover:scale-100",
              ),
        )}
      >
        <div className="bg-foreground text-background overflow-hidden rounded-3xl shadow-2xl">
          {hoverCard}
        </div>
      </div>
    </div>
  );
}
