import { motion } from "framer-motion";
import { Trash2Icon } from "lucide-react";

import { cn } from "@/lib/utils/classname";

export default function ParticipantChip({
  person,
  index,
  isAvailable,
  isRemoving,
  onRemove,
  onHoverChange,
  onClick,
  isSelected,
  areSelected,
}: {
  person: string;
  index: number;
  isAvailable: boolean;
  isRemoving: boolean;
  onRemove: () => void;
  onHoverChange: (isHovering: boolean) => void;
  onClick: () => void;
  isSelected: boolean;
  areSelected: boolean;
}) {
  //  delay based on index
  const delay = (index % 4) * -0.1;

  const variants = {
    enter: {
      height: "auto",
      marginBottom: "0.625rem",
      marginRight: "0.625rem",
      opacity: 1,
      y: 0,
      transition: {
        // Grow first
        height: { duration: 0.2 },
        marginBottom: { duration: 0.2 },
        marginRight: { duration: 0.2 },
        // Fade in last
        opacity: { duration: 0.2, delay: 0.4 },
        y: { duration: 0.2, delay: 0.4 },
      },
    },
    exit: {
      height: 0,
      marginBottom: 0,
      marginRight: 0,
      opacity: 0,
      y: "40%",
      transition: {
        // Fade out first
        opacity: { duration: 0.2 },
        y: { duration: 0.2 },
        // Shrink last
        height: { duration: 0.2, delay: 0.4 },
        marginBottom: { duration: 0.2, delay: 0.4 },
        marginRight: { duration: 0.2, delay: 0.4 },
      },
    },
  };

  const ChipContent = (
    <motion.li
      initial={{
        height: 0,
        marginBottom: 0,
        marginRight: 0,
        opacity: 0,
        y: "40%",
      }}
      animate="enter"
      exit="exit"
      variants={variants}
      layout
    >
      <div
        style={{ animationDelay: `${delay}s` }}
        onMouseEnter={() => {
          if (window.matchMedia("(hover: hover)").matches) {
            onHoverChange(true);
          }
        }}
        onMouseLeave={() => onHoverChange(false)}
        onClick={() => {
          if (isRemoving) {
            onRemove();
          } else {
            onHoverChange(false);
            onClick();
          }
        }}
        className={cn(
          "relative flex w-fit touch-manipulation items-center justify-center rounded-full transition-[opacity,shadow] duration-200 hover:cursor-pointer",
          "px-3 py-1.5 text-base",
          "md:px-3 md:py-1 md:text-sm",
          "border border-transparent",
          "after:absolute after:-inset-1 after:content-['']",

          // Availability Styling
          !isAvailable && "bg-gray-200/25 line-through opacity-50",
          isAvailable && "bg-accent/25 text-accent-text opacity-100",

          // Selection Styling
          isSelected &&
            "bg-accent ring-accent ring-offset-background text-white ring-2 ring-offset-1",
          areSelected && !isSelected && "bg-gray-200/25",

          // Hover Styling
          !isRemoving && !isSelected && "hover:bg-accent hover:text-white",

          // Wiggle/Remove Styling
          isRemoving &&
            cn(
              "animate-wiggle scale-102 group hover:cursor-pointer md:scale-100",
              "hover:bg-error hover:text-white hover:opacity-100",
              "active:bg-[color-mix(in_oklab,var(--color-error)_100%,black_10%)]",
            ),
        )}
      >
        <span
          className={cn(
            "transition-opacity duration-200",
            isRemoving && "group-hover:opacity-0",
          )}
        >
          {person}
        </span>

        {isRemoving && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <Trash2Icon className="h-4 w-4" />
          </div>
        )}
      </div>
    </motion.li>
  );

  return ChipContent;
}
