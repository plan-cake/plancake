import { Fragment, useState, useId } from "react";

import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { motion, AnimatePresence, Transition } from "framer-motion";

import { ButtonArray } from "@/features/button/button-array";
import EmptyButton from "@/features/button/components/empty";
import { cn } from "@/lib/utils/classname";

const morphTransition: Transition = {
  type: "spring",
  damping: 25,
  stiffness: 400,
  mass: 0.8,
};

export default function KebabMenu({
  buttons,
  trigger,
}: {
  buttons: ButtonArray;
  trigger?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const id = useId();
  return (
    <div className="relative">
      {/* Placeholder */}
      <div className="pointer-events-none invisible" aria-hidden="true">
        <EmptyButton
          buttonStyle="semi-transparent"
          icon={<DotsVerticalIcon />}
        />
      </div>

      <AnimatePresence>
        {!isOpen ? (
          <motion.div
            layout
            key="trigger"
            layoutId={"popover-morph-" + id}
            transition={morphTransition}
            className="absolute right-0 top-0 z-10 inline-block rounded-full"
            aria-haspopup="menu"
            aria-expanded={isOpen}
            onClick={() => setIsOpen(true)}
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
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              key="content"
              layout
              layoutId={"popover-morph-" + id}
              transition={morphTransition}
              className={cn(
                "absolute right-0 top-0 z-10",
                "flex min-w-[200px] origin-top-right flex-col gap-2",
                "frosted-glass rounded-4xl overflow-hidden p-4 shadow-lg",
              )}
            >
              {buttons.map((button, index) => (
                <Fragment key={index}>{button}</Fragment>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
