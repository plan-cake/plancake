"use client";

import { useEffect, useState } from "react";

import { CarouselDrawer } from "@/features/drawer";
import { DEMO_STEPS_CONFIG } from "@/features/landing-page/demo/lib/config";
import { useDemo } from "@/features/landing-page/demo/lib/use-demo";
import OrbitImages from "@/features/landing-page/demo/orbit-images";
import OrbitNode from "@/features/landing-page/demo/orbit-node";
import { cn } from "@/lib/utils/classname";

export default function HowItWorksSection() {
  const { activeStep, setActiveStep, getStepBody } = useDemo();

  const [orbitScale, setOrbitScale] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const orbitNodes = [...DEMO_STEPS_CONFIG].reverse().map((config) => {
    const body = getStepBody(config.step);

    const hoverCard = (
      <div className="w-full p-4">
        <div className={cn("text-center", body && "mb-4")}>
          <div className="text-lg font-bold">{config.title}</div>
          <div className="text-background/70 text-sm">{config.description}</div>
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
        openAbove={config.openAbove}
      />
    );
  });

  // Map configuration to the format for CarouselDrawer
  const carouselSteps = DEMO_STEPS_CONFIG.map((config) => ({
    ...config,
    content: getStepBody(config.step),
  }));

  return (
    <div className="bg-panel rounded-4xl flex flex-col overflow-visible p-12">
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
            Try it out by <span className="max-md:hidden">hovering over</span>
            <span className="md:hidden">tapping</span> the steps below!
          </p>
        </div>
      </div>

      <div className="relative mt-4 flex w-full items-center justify-center">
        <div className="mx-auto w-full max-w-[900px]">
          <OrbitImages
            images={orbitNodes}
            shape="ellipse"
            baseWidth={900}
            radiusX={300}
            radiusY={isMobile ? 320 : 230}
            rotation={-20}
            duration={45}
            itemSize={160}
            responsive={true}
            onScaleChange={setOrbitScale}
            direction="normal"
            fill
            showPath
            paused={true}
            pathColor="currentColor"
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
