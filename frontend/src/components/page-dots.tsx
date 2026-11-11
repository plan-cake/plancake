import { motion } from "framer-motion";

import { cn } from "@/lib/utils/classname";

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
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: count }).map((_, index) => {
        const isActive = activeIndex === index;
        return (
          <button
            key={index}
            onClick={() => onSelect(index)}
            aria-label={`Go to ${itemLabel} ${index + 1}`}
            aria-current={isActive ? "page" : undefined}
            className="relative flex h-4 items-center justify-center"
          >
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
  );
}
