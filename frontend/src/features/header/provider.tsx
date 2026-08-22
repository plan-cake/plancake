"use client";

import { useCallback, useEffect, useState } from "react";

import {
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

import { HeaderSizeContext } from "@/features/header/context";

const SCROLL_THRESHOLD = 100;

export default function HeaderSizeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isFullSize, setIsFullSize] = useState(true);

  const { scrollY } = useScroll();
  const scrollAnchor = useMotionValue(0);
  const shrinkAmount = useMotionValue(0);
  const smoothShrinkAmount = useSpring(shrinkAmount, {
    damping: 15,
    stiffness: 300,
    mass: 0.1,
  });
  const headerHeight = useTransform(smoothShrinkAmount, [0, 1], [88, 52]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--header-height",
      `${headerHeight.get()}px`,
    );
  }, [headerHeight]);

  const handleScrollChange = useCallback(
    (value: number) => {
      // Clamp value to page height
      value = Math.max(
        0,
        Math.min(value, document.body.scrollHeight - window.innerHeight),
      );

      const scrollOffset = value - scrollAnchor.get();

      if (scrollOffset > SCROLL_THRESHOLD) {
        scrollAnchor.set(value - SCROLL_THRESHOLD);
      } else if (scrollOffset < 0) {
        scrollAnchor.set(value);
      }

      shrinkAmount.set(
        Math.min(Math.max(scrollOffset / SCROLL_THRESHOLD, 0), 1),
      );
    },
    [scrollAnchor, shrinkAmount],
  );

  useMotionValueEvent(scrollY, "change", handleScrollChange);

  useMotionValueEvent(scrollAnchor, "change", handleScrollChange);

  useMotionValueEvent(smoothShrinkAmount, "change", () => {
    document.documentElement.style.setProperty(
      "--header-height",
      `${headerHeight.get()}px`,
    );

    setIsFullSize(smoothShrinkAmount.get() === 0);
  });

  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const expand = useCallback(() => {
    scrollAnchor.set(scrollY.get());
  }, [scrollY, scrollAnchor]);

  return (
    <HeaderSizeContext.Provider
      value={{
        isFullSize,
        shrinkAmount: smoothShrinkAmount,
        expand,
        activeMenu,
        setActiveMenu,
      }}
    >
      {children}
    </HeaderSizeContext.Provider>
  );
}
