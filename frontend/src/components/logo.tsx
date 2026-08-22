"use client";

import { motion, useTransform } from "framer-motion";

import { useHeaderSize } from "@/features/header/context";
import { cn } from "@/lib/utils/classname";

export default function Logo({
  shrinkOnScroll = false,
}: {
  shrinkOnScroll?: boolean;
}) {
  const { shrinkAmount } = useHeaderSize();

  const smallStyle = useTransform(shrinkAmount, [0, 1], {
    opacity: [0, 1],
  });
  const largeStyle = useTransform(shrinkAmount, [0, 1], {
    opacity: [1, 0],
  });

  return (
    <div className="font-display text-lion select-none text-2xl font-normal [-webkit-text-stroke:1px_black]">
      <div>
        <span>plan</span>
        <motion.span
          className={cn("absolute", shrinkOnScroll ? "" : "opacity-0")}
          style={shrinkOnScroll ? smallStyle : undefined}
        >
          cake
        </motion.span>
      </div>
      <motion.div style={shrinkOnScroll ? largeStyle : undefined}>
        cake
      </motion.div>
    </div>
  );
}
