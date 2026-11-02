"use client";

import { useCallback, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import ActionButton from "@/features/button/components/action";
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

const STEP_TRANSITION = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 0.8,
} as const;

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

  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const contentRef = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    const observer = new ResizeObserver(() =>
      setContentHeight(el.offsetHeight),
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      // Start from the natural height again the next time the drawer opens
      setContentHeight(null);
    };
  }, []);

  const currentIndex = steps.findIndex((s) => s.step === activeStep);
  const currentStepObj = steps[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < steps.length - 1;

  return (
    <FloatingDrawer
      title={currentStepObj?.title ?? ""}
      open={open}
      onOpenChange={onOpenChange}
      description=""
      contentClassName="h-fit overflow-hidden"
    >
      <div className="flex flex-col">
        {/* Step Content Area */}
        <motion.div
          className="relative overflow-hidden"
          initial={false}
          animate={{ height: contentHeight ?? "auto" }}
          transition={STEP_TRANSITION}
        >
          <div ref={contentRef}>
            <AnimatePresence
              mode="popLayout"
              initial={false}
              custom={direction}
            >
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
                  transition={STEP_TRANSITION}
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
        </motion.div>

        {/* Step Navigation */}
        <div className="mt-6 flex items-center justify-center gap-4 pb-2">
          <ActionButton
            buttonStyle="semi-transparent"
            icon={<ChevronLeftIcon />}
            onClick={() => onStepChange(steps[currentIndex - 1].step)}
            disabled={!hasPrev}
            className="p-1.5"
            aria-label="Previous Step"
          />

          {/* Morphing Step Indicators */}
          <div className="flex items-center gap-2">
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

          <ActionButton
            buttonStyle="semi-transparent"
            icon={<ChevronRightIcon />}
            onClick={() => onStepChange(steps[currentIndex + 1].step)}
            disabled={!hasNext}
            className="p-1.5"
            aria-label="Next Step"
          />
        </div>
      </div>
    </FloatingDrawer>
  );
}
