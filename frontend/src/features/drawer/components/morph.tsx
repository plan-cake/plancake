import { useState } from "react";

import { Drawer } from "vaul";

import { StandardDrawerProps } from "@/features/drawer/components/base";
import { useDrawerResize } from "@/features/drawer/useDrawerResize";
import { cn } from "@/lib/utils/classname";

export interface MorphingDrawerProps extends StandardDrawerProps {
  pillHeaderContent?: React.ReactNode;
}

export function MorphingDrawer({
  open,
  onOpenChange,
  trigger,
  title,
  headerContent,
  pillHeaderContent,
  footerContent,
  description = "Drawer contents",
  children,
  snapPoints,
  contentClassName,
  bodyClassName,
  scrollableBody = true,
  showHandle = true,
  frostedGlass = false,
  modal = true,
  showOverlay = modal,
  nested = false,
  activeSnapPoint,
  setActiveSnapPoint,
}: MorphingDrawerProps) {
  useDrawerResize();
  const [internalSnap, setInternalSnap] = useState<number | string | null>(
    snapPoints?.[0] ?? null,
  );

  const snap = activeSnapPoint !== undefined ? activeSnapPoint : internalSnap;
  const setSnap = setActiveSnapPoint ?? setInternalSnap;
  const [isDragging, setIsDragging] = useState(false);

  // Morphing logic
  const isLowestSnap = snapPoints && String(snap) === String(snapPoints[0]);
  const isPill = isLowestSnap && !isDragging;
  const activeHeaderContent =
    isPill && pillHeaderContent ? pillHeaderContent : headerContent;

  const DrawerComponent = nested ? Drawer.NestedRoot : Drawer.Root;

  const snapValue = typeof snap === "number" ? snap : parseFloat(String(snap));
  const isFraction = !isNaN(snapValue) && snapValue > 0 && snapValue <= 1;
  const visibleHeight = isFraction
    ? `calc(${snapValue * 100}svh + 8px)`
    : snap || "auto";

  return (
    <DrawerComponent
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={snapPoints}
      modal={modal}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      onDrag={() => setIsDragging(true)}
      onRelease={() => setIsDragging(false)}
    >
      {trigger && <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>}
      <Drawer.Portal>
        {showOverlay && (
          <Drawer.Overlay
            className={cn(
              "fixed inset-0",
              nested ? "z-[99]" : "z-40",
              frostedGlass ? "bg-black/1" : "bg-black/30",
            )}
          />
        )}

        {footerContent && (
          <div
            className={cn(
              "fixed bottom-0 left-0 right-0 z-[60] w-full shrink-0 px-4",
              !frostedGlass && "bg-panel",
              "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
              open ? "translate-y-0" : "translate-y-full",
              isPill
                ? "hidden max-w-[calc(100%-2rem)] rounded-[40px] border border-white/10"
                : "max-w-full rounded-t-[32px] border-transparent shadow-none",
            )}
          >
            {footerContent}
          </div>
        )}

        <Drawer.Content
          className={cn(
            "fixed bottom-0 left-0 right-0 flex h-[100svh] flex-col bg-transparent outline-none",
            nested ? "z-[100]" : "z-50",
            contentClassName,
          )}
        >
          <div
            className="flex w-full flex-col transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
            style={{ height: isPill ? visibleHeight : "100%" }}
          >
            {/* Invisible spacer that pushes the pill down */}
            <div
              className="pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
              style={{
                flexGrow: isPill ? 1 : 0,
                flexBasis: isPill ? "auto" : "0px",
                minHeight: 0,
              }}
            />

            <div
              className={cn(
                "mx-auto flex w-full flex-col overflow-hidden transition-[max-width,border-radius,margin] duration-300",
                isPill
                  ? "border-foreground/10 rounded-4xl mb-4 max-w-[calc(100%-2rem)] border"
                  : "border-foreground/10 max-w-full rounded-t-[32px] border",
                frostedGlass ? "frosted-glass" : "bg-panel",
                !isPill && "min-h-0 flex-1",
              )}
            >
              <div
                onPointerDown={() => setIsDragging(true)}
                onPointerUp={() => setIsDragging(false)}
                onPointerCancel={() => setIsDragging(false)}
                className="flex h-full min-h-0 w-full flex-col"
              >
                <div className="shrink-0 px-8 pb-2">
                  {showHandle && (
                    <Drawer.Handle className="!bg-foreground/50 mx-auto mt-2 !w-14" />
                  )}
                  <div className={cn(showHandle && "mt-1")}>
                    {(title || headerContent) && (
                      <div
                        className={cn(
                          isPill ? "text-center" : "flex items-center",
                        )}
                      >
                        {activeHeaderContent ? (
                          <>
                            <Drawer.Title className="sr-only">
                              {title}
                            </Drawer.Title>
                            <div className={cn(!isPill && "flex-1")}>
                              {activeHeaderContent}
                            </div>
                          </>
                        ) : (
                          <Drawer.Title
                            className={cn(
                              "mb-0 text-lg font-semibold",
                              !isPill && "flex-1",
                            )}
                          >
                            {title}
                          </Drawer.Title>
                        )}
                      </div>
                    )}
                    <Drawer.Description className="sr-only">
                      {description}
                    </Drawer.Description>
                  </div>
                </div>

                <div
                  className={cn(
                    "min-h-0 flex-1 px-8 pb-4",
                    scrollableBody && "overflow-y-auto",
                    bodyClassName,
                    isPill && "hidden",
                  )}
                  data-vaul-no-drag
                >
                  {children}

                  {/**
                   * This takes up the space of the drawer that Vaul shifted off
                   * the bottom of the screen
                   */}
                  {!isPill && scrollableBody && (
                    <div
                      className="shrink-0"
                      style={{
                        height: "calc(var(--snap-point-height, 0px) + 50px)",
                      }}
                    />
                  )}
                </div>
              </div>

              {footerContent && isPill && (
                <div
                  className={cn(
                    "m-2 mt-auto shrink-0",
                    !frostedGlass && "bg-panel",
                  )}
                >
                  {footerContent}
                </div>
              )}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </DrawerComponent>
  );
}
