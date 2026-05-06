import { AnimatePresence, motion, Variants } from "framer-motion";
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
  // wiggle animation delay based on index
  const wiggleDelay = (index % 4) * -0.1;

  const variants: Variants = {
    enter: {
      height: "auto",
      marginBottom: "0.625rem",
      opacity: 1,
      y: 0,
      transition: {
        // Grow first
        height: { duration: 0.3, ease: "easeOut" },
        marginBottom: { duration: 0.3, ease: "easeOut" },
        // Fade in last
        opacity: { duration: 0.4, delay: 0.4, ease: "backOut" },
        y: { duration: 0.4, delay: 0.4, ease: "backOut" },
      },
    },
    exit: {
      height: 0,
      marginBottom: 0,
      opacity: 0,
      y: "40%",
      transition: {
        // Fade out first
        opacity: { duration: 0.4, ease: "backIn" },
        y: { duration: 0.4, ease: "backIn" },
        // Shrink last
        height: { duration: 0.3, delay: 0.4, ease: "easeOut" },
        marginBottom: { duration: 0.3, delay: 0.4, ease: "easeOut" },
      },
    },
  };

  const ChipContent = (
    <motion.li
      className="self-start" // prevents framer motion issue with row height on enter
      initial={{
        height: 0,
        marginBottom: 0,
        opacity: 0,
        y: "40%",
      }}
      animate="enter"
      exit="exit"
      variants={variants}
      layout="position"
    >
      <div
        style={{ animationDelay: `${wiggleDelay}s` }}
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
          isAvailable && "bg-lion text-violet opacity-100",

          !isAvailable && isSelected && "text-violet",

          // Selection Styling
          isSelected &&
            "bg-lion ring-lion ring-offset-background ring-2 ring-offset-1",
          areSelected && !isSelected && "text-foreground bg-gray-200/25",

          // Hover Styling
          !isRemoving &&
            !isSelected &&
            "hover:ring-lion/50 hover:ring-offset-background hover:ring-2 hover:ring-offset-1",

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
          <TransitioningDisplayName displayName={person} />
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

function TransitioningDisplayName({ displayName }: { displayName: string }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={displayName}
        initial={{ y: "50%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "-50%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="inline-block"
      >
        {displayName}
      </motion.span>
    </AnimatePresence>
  );
}
