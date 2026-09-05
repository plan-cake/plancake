"use client";

import { useState } from "react";

import { AnimatePresence, motion, MotionValue } from "framer-motion";
import Image from "next/image";

import SegmentedControl from "@/components/segmented-control";
import {
  HERO_IMAGES,
  HeroImageTheme,
  HeroImageView,
} from "@/features/landing-page/hero/config";

interface HeroImageProps {
  imageY: MotionValue<string>;
  theme: HeroImageTheme;
}

export default function HeroImage({ imageY, theme }: HeroImageProps) {
  const [heroImageView, setHeroImageView] =
    useState<HeroImageView>("specific-dates");

  const desktopImage = HERO_IMAGES[heroImageView].desktop[theme];
  const mobileImage = HERO_IMAGES[heroImageView].mobile[theme];

  return (
    <motion.div
      style={{
        y: imageY,
        willChange: "transform",
        transform: "translateZ(0)",
      }}
      className="pointer-events-none absolute inset-x-0 bottom-0 z-20 mx-auto w-[90vw] max-w-[1296px]"
    >
      <div className="pointer-events-auto relative z-10 mx-auto mb-4 w-64">
        <SegmentedControl
          options={[
            { label: "Specific Dates", value: "specific-dates" },
            { label: "Weekly", value: "weekly" },
          ]}
          value={heroImageView}
          onChange={setHeroImageView}
          className="bg-background shadow-lg"
        />
      </div>

      <div
        className="relative hidden w-full md:block"
        style={{
          aspectRatio: `${desktopImage.width} / ${desktopImage.height}`,
        }}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={heroImageView}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              aria-hidden
              src={desktopImage.src}
              alt="Hero Image"
              fill
              sizes="90vw"
              className="pointer-events-none select-none rounded-3xl object-cover shadow-2xl"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div
        className="relative mx-auto block w-3/5 max-w-[260px] md:hidden"
        style={{ aspectRatio: `${mobileImage.width} / ${mobileImage.height}` }}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={heroImageView}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              aria-hidden
              src={mobileImage.src}
              alt="Hero Image"
              fill
              sizes="60vw"
              className="pointer-events-none select-none rounded-3xl object-cover shadow-2xl"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
