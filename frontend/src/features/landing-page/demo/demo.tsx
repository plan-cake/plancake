"use client";

import { useEffect, useState } from "react";

import { CarouselDrawer } from "@/features/drawer";
import { DEMO_STEPS_CONFIG } from "@/features/landing-page/demo/lib/config";
import { useDemo } from "@/features/landing-page/demo/lib/use-demo";
import Orbit from "@/features/landing-page/demo/orbit";
import OrbitNode from "@/features/landing-page/demo/orbit-node";
import usePointerType from "@/lib/hooks/use-pointer-type";
import { cn } from "@/lib/utils/classname";

export default function HowItWorksSection() {
  const { activeStep, setActiveStep, getStepBody } = useDemo();
  const bodyInDrawer = activeStep !== null;

  const [orbitScale, setOrbitScale] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const pointerType = usePointerType();
  const usesDrawer = isMobile || pointerType === "coarse";

  const orbitNodes = [...DEMO_STEPS_CONFIG].reverse().map((config) => {
    const body = bodyInDrawer ? null : getStepBody(config.step);

    const hoverCard = (
      <div className="w-full p-4">
        <div className={cn("text-center", body && "mb-4")}>
          <div className="text-lg font-bold">{config.title}</div>
          <div className="text-background/70">{config.description}</div>
        </div>
        {body}
      </div>
    );

    return (
      <OrbitNode
        key={config.step}
        stepNumber={config.step}
        label={config.label}
        hoverCard={hoverCard}
        onSelect={() => setActiveStep(config.step)}
        orbitScale={orbitScale}
        usesDrawer={usesDrawer}
        cardPosition={config.cardPosition}
      />
    );
  });

  // Map configuration to the format for CarouselDrawer
  const carouselSteps = DEMO_STEPS_CONFIG.map((config) => ({
    ...config,
    // Only mount the body in the drawer if the drawer is actually open
    content: bodyInDrawer ? getStepBody(config.step) : null,
  }));

  return (
    <div className="bg-panel rounded-4xl flex flex-col overflow-visible p-12 md:pb-0">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
        <h2 className="text-foreground font-display text-5xl tracking-wide md:text-6xl">
          the perfect recipe
        </h2>
        <div className="text-foreground/80 max-w-md text-lg md:text-xl">
          <p>
            Four simple steps to coordinate your next group event without the
            messy back-and-forth.
          </p>
          <p className="text-foreground mt-2 text-sm font-semibold md:text-lg">
            Try it out by {usesDrawer ? "tapping" : "hovering over"} the steps
            below!
          </p>
        </div>
      </div>

      <div className="relative mt-4 flex w-full items-center justify-center md:-mt-8">
        <div className="mx-auto w-full max-w-[900px]">
          <Orbit
            images={orbitNodes}
            baseWidth={900}
            radiusX={300}
            radiusY={isMobile ? 320 : 230}
            rotation={-20}
            itemSize={160}
            onScaleChange={setOrbitScale}
            className="text-foreground/75"
          />
        </div>
      </div>

      <div className="flex-shrink-0" />

      <CarouselDrawer
        open={activeStep !== null}
        onOpenChange={(open) => !open && setActiveStep(null)}
        activeStep={activeStep}
        onStepChange={setActiveStep}
        steps={carouselSteps}
      />
    </div>
  );
}
