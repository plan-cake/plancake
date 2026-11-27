"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import { AnimatePresence, motion, Transition } from "framer-motion";
import { EllipsisVerticalIcon } from "lucide-react";

import EmptyButton from "@/features/button/components/empty";
import { cn } from "@/lib/utils/classname";

const morphTransition: Transition = {
  type: "spring",
  damping: 25,
  stiffness: 400,
  mass: 0.8,
};

export type AnchorPoint = "top-left" | "top-center" | "top-right";

export default function KebabMenu({
  children,
  trigger,
  open: controlledOpen,
  onOpenChange,
  anchorPoint = "top-right",
  nested = false,
  closeOnClick = true,
}: {
  children: React.ReactNode;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  anchorPoint?: AnchorPoint;
  nested?: boolean;
  closeOnClick?: boolean;
}) {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef(false);

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
        restoreFocusRef.current = false;
        handleOpenChange(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        restoreFocusRef.current = true;
        handleOpenChange(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleOpenChange, open]);

  // When closed with the keyboard, move focus back to the remounted trigger
  useEffect(() => {
    if (open || !restoreFocusRef.current) return;
    restoreFocusRef.current = false;
    triggerRef.current
      ?.querySelector<HTMLElement>("button, [tabindex]")
      ?.focus();
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      {/* The invisible trigger is used to reserve space in the layout for the
      menu button, preventing layout shifts when the menu opens/closes. The
      actual visible trigger is absolutely positioned on top of it and only
      rendered when the menu is closed. */}
      <div className="pointer-events-none invisible" aria-hidden="true">
        {trigger ? (
          trigger
        ) : (
          <EmptyButton
            buttonStyle="semi-transparent"
            icon={<EllipsisVerticalIcon />}
          />
        )}
      </div>
      <AnimatePresence initial={false}>
        {!open ? (
          <motion.div
            layout
            key="trigger"
            ref={triggerRef}
            layoutId={"popover-morph-" + id}
            transition={morphTransition}
            className={cn(
              "absolute top-0 z-10 inline-block cursor-pointer rounded-full",
              anchorPoint === "top-right" && "right-0",
              anchorPoint === "top-left" && "left-0",
              anchorPoint === "top-center" && "left-1/2 -translate-x-1/2",
            )}
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => handleOpenChange(true)}
          >
            {trigger ? (
              trigger
            ) : (
              <EmptyButton
                buttonStyle="semi-transparent"
                icon={<EllipsisVerticalIcon />}
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
              "absolute top-0 z-[100]",
              anchorPoint === "top-right" && "right-0 origin-top-right",
              anchorPoint === "top-left" && "left-0 origin-top-left",
              anchorPoint === "top-center" &&
                "left-1/2 origin-top -translate-x-1/2",
              "flex min-w-[200px] flex-col gap-2",
              "frosted-glass overflow-hidden rounded-3xl p-4 shadow-lg",
              nested && "scale-[calc(1/0.95)]",
            )}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (
                (target.closest("button") ||
                  target.closest("a") ||
                  target.closest('[role="button"]') ||
                  target.closest('[role="menuitem"]')) &&
                closeOnClick
              ) {
                handleOpenChange(false);
              }
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
