import { Fragment, useState } from "react";

import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { motion, AnimatePresence, Transition } from "framer-motion";

import { ButtonArray } from "@/features/button/button-array";
import EmptyButton from "@/features/button/components/empty";

const morphTransition: Transition = {
  type: "spring",
  damping: 25,
  stiffness: 300,
  mass: 1,
};

export default function KebabMenu({ buttons }: { buttons: ButtonArray }) {
  const [isOpen, setIsOpen] = useState(false);
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
            key="trigger"
            layoutId={`popover-morph`}
            transition={morphTransition}
            className="absolute right-0 top-0 z-50 inline-block rounded-full"
            onClick={() => setIsOpen(true)}
          >
            <EmptyButton
              buttonStyle="semi-transparent"
              icon={<DotsVerticalIcon />}
            />
          </motion.div>
        ) : (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              key="content"
              layoutId={`popover-morph`}
              transition={morphTransition}
              className="frosted-glass rounded-4xl absolute right-0 top-0 z-50 flex min-w-[200px] origin-top-right flex-col gap-2 overflow-hidden p-4 shadow-lg"
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
