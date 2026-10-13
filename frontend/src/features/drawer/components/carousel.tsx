"use client";

import { useRef, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { FloatingDrawer } from "@/features/drawer";
import { cn } from "@/lib/utils/classname";

export interface CarouselStep {
  step: number;
  title: string;
  description: string;
  content: React.ReactNode;
}

export interface CarouselDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeStep: number | null;
  onStepChange: (step: number) => void;
  steps: CarouselStep[];
}

export default function CarouselDrawer({
  open,
  onOpenChange,
  activeStep,
  onStepChange,
  steps,
}: CarouselDrawerProps) {
  const [prevStep, setPrevStep] = useState(activeStep);
  const [direction, setDirection] = useState(0);

  // Derive animation direction based on step changes (internal or external)
  if (activeStep !== prevStep) {
    if (activeStep !== null && prevStep !== null) {
      const currentIndex = steps.findIndex((s) => s.step === activeStep);
      const prevIndex = steps.findIndex((s) => s.step === prevStep);
      setDirection(currentIndex > prevIndex ? 1 : -1);
    }
    setPrevStep(activeStep);
  }

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const isSwipingIgnored = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    // If touching the interactive grid, ignore the swipe!
    if ((e.target as HTMLElement).closest('[data-no-swipe="true"]')) {
      isSwipingIgnored.current = true;
      return;
    }

    isSwipingIgnored.current = false;
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isSwipingIgnored.current) return;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (isSwipingIgnored.current) return;
    if (touchStartX.current === null || touchEndX.current === null) return;

    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (activeStep !== null) {
      const currentIndex = steps.findIndex((s) => s.step === activeStep);
      if (distance > minSwipeDistance && currentIndex < steps.length - 1) {
        onStepChange(steps[currentIndex + 1].step);
      } else if (distance < -minSwipeDistance && currentIndex > 0) {
        onStepChange(steps[currentIndex - 1].step);
      }
    }
  };

  const currentStepObj = steps.find((s) => s.step === activeStep);

  return (
    <FloatingDrawer
      title={currentStepObj?.title ?? ""}
      open={open}
      onOpenChange={onOpenChange}
      description=""
      contentClassName="h-fit overflow-hidden"
    >
      <div className="flex flex-col">
        {/* Swipeable Step Content Area */}
        <div
          className="relative overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            {currentStepObj && (
              <motion.div
                key={currentStepObj.step}
                custom={direction}
                variants={{
                  enter: (dir: number) => ({
                    x: dir > 0 ? 100 : -100,
                    opacity: 0,
                  }),
                  center: { x: 0, opacity: 1 },
                  exit: (dir: number) => ({
                    x: dir > 0 ? -100 : 100,
                    opacity: 0,
                  }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  mass: 0.8,
                }}
                className="flex flex-col gap-4"
              >
                <p className="text-foreground/70 text-center">
                  {currentStepObj.description}
                </p>
                {currentStepObj.content}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Morphing Step Indicators */}
        <div className="mt-6 flex items-center justify-center gap-2 pb-2">
          {steps.map((config) => {
            const isActive = activeStep === config.step;
            return (
              <button
                key={config.step}
                onClick={() => onStepChange(config.step)}
                aria-label={`Go to step ${config.step}`}
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
      </div>
    </FloatingDrawer>
  );
}
