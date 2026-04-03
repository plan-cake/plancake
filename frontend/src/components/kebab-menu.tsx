"use client";

import { useState, useId, useEffect, useRef, useCallback } from "react";

import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { motion, AnimatePresence, Transition } from "framer-motion";

import EmptyButton from "@/features/button/components/empty";
import { cn } from "@/lib/utils/classname";

const morphTransition: Transition = {
  type: "spring",
  damping: 25,
  stiffness: 400,
  mass: 0.8,
};

export default function KebabMenu({
  children,
  trigger,
  open: controlledOpen,
  onOpenChange,
  nested = false,
}: {
  children: React.ReactNode;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  nested?: boolean;
}) {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  /* OPEN STATE MANAGEMENT */
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [isControlled, onOpenChange],
  );

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        handleOpenChange(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleOpenChange, open]);

  return (
    <div className="relative" ref={containerRef}>
      <div className="pointer-events-none invisible" aria-hidden="true">
        {trigger ? (
          trigger
        ) : (
          <EmptyButton
            buttonStyle="semi-transparent"
            icon={<DotsVerticalIcon />}
          />
        )}
      </div>

      <AnimatePresence initial={false}>
        {!open ? (
          <motion.div
            layout
            key="trigger"
            layoutId={"popover-morph-" + id}
            transition={morphTransition}
            className="absolute right-0 top-0 z-10 inline-block cursor-pointer rounded-full"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => handleOpenChange(true)}
          >
            {trigger ? (
              trigger
            ) : (
              <EmptyButton
                buttonStyle="semi-transparent"
                icon={<DotsVerticalIcon />}
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            layout
            layoutId={"popover-morph-" + id}
            transition={morphTransition}
            className={cn(
              "absolute right-2 top-1 z-[100]",
              "flex min-w-[200px] origin-top-right flex-col gap-2",
              "frosted-glass overflow-hidden rounded-3xl p-4 shadow-lg",
              nested && "scale-110",
            )}
            onClick={() => handleOpenChange(false)}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
