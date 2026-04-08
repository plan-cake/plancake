import { useState, useRef } from "react";

import { Cross1Icon } from "@radix-ui/react-icons";
import { Drawer } from "vaul";

import ActionButton from "@/features/button/components/action";
import { DrawerProps } from "@/features/drawer/props";
import { useDrawerResize } from "@/features/drawer/useDrawerResize";
import { useVaulStickyFooter } from "@/features/drawer/useStickyFooter";
import useKeyboardHeight from "@/lib/hooks/use-keyboard-height";
import { cn } from "@/lib/utils/classname";

export default function BaseDrawer({
  _type = "standard",
  open,
  onOpenChange,
  trigger,
  title,
  headerContent,
  description = "Drawer contents",
  children,
  contentClassName,
  bodyClassName,
  scrollableBody = true,
  showHandle = true,
  frostedGlass = false,
  modal = true,
  showOverlay = !frostedGlass && modal,
  nested = false,
  ...rest
}: DrawerProps) {
  useDrawerResize();
  const keyboardOffset = useKeyboardHeight();

  const contentRef = useRef<HTMLDivElement>(null);
  const wasDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useVaulStickyFooter(contentRef, isDragging || isAnimating);

  /**
   * CONDITIONAL PROPS BASED ON VARIANT
   *
   * Since BaseDrawer is used for all variants, we need to conditionally handle
   * props that only apply to certain types of drawers.
   */
  const snapPoints = "snapPoints" in rest ? rest.snapPoints : undefined;
  const activeSnapPoint =
    "activeSnapPoint" in rest ? rest.activeSnapPoint : undefined;
  const setActiveSnapPoint =
    "setActiveSnapPoint" in rest ? rest.setActiveSnapPoint : undefined;
  const footerContent =
    "footerContent" in rest ? rest.footerContent : undefined;
  const pillHeaderContent =
    "pillHeaderContent" in rest ? rest.pillHeaderContent : undefined;
  const floatingAtLowestSnap =
    "floatingAtLowestSnap" in rest ? rest.floatingAtLowestSnap : false;

  /**
   * SNAP POINT MANAGEMENT
   *
   * For standard and morphing drawers, we manage snap points to allow the drawer to
   * be draggable between defined heights. Since morphing drawers can transition
   * between a pill and a full drawer, we also track the lowest snap point.
   */
  const [internalSnap, setInternalSnap] = useState<number | string | null>(
    snapPoints?.[0] ?? null,
  );

  const snap = activeSnapPoint !== undefined ? activeSnapPoint : internalSnap;
  const setSnap = setActiveSnapPoint ?? setInternalSnap;

  const isLowestSnap = snapPoints && String(snap) === String(snapPoints[0]);

  // It's a pill if it's explicitly 'floating', OR if it's 'morphing',
  // at the lowest snap, not being dragged, AND floatingAtLowestSnap is true.
  const isPill =
    _type === "floating" ||
    (_type === "morphing" &&
      floatingAtLowestSnap &&
      !!isLowestSnap &&
      !isDragging);

  const activeHeaderContent =
    isPill && pillHeaderContent ? pillHeaderContent : headerContent;

  const snapValue = typeof snap === "number" ? snap : parseFloat(String(snap));
  const isFraction = !isNaN(snapValue) && snapValue > 0 && snapValue <= 1;
  const visibleHeight = isFraction
    ? `calc(${snapValue * 100}svh + 8px)`
    : snap || "auto";

  /**
   * Z-INDEX CALCULATION FOR NESTED DRAWERS
   *
   * To ensure that nested drawers stack correctly, we calculate z-index values
   * based on the nesting level. Each level of nesting increases the z-index to
   * ensure proper stacking order.
   */
  const nestingLevel = typeof nested === "number" ? nested : nested ? 1 : 0;
  const overlayZIndex = 40 + nestingLevel * 100;
  const contentZIndex = 50 + nestingLevel * 100;

  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={snapPoints}
      modal={modal}
      dismissible={_type === "morphing" ? !isPill : true}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      onDrag={() => {
        setIsDragging(true);
        wasDraggingRef.current = true;
      }}
      onRelease={() => {
        setIsDragging(false);
        setTimeout(() => {
          wasDraggingRef.current = false;
        }, 50);
      }}
    >
      {trigger && <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>}

      <Drawer.Portal>
        {showOverlay && (
          <Drawer.Overlay
            onClick={() => onOpenChange?.(false)}
            className={cn(
              "fixed inset-0",
              frostedGlass ? "bg-black/1" : "bg-black/30",
            )}
            style={{ zIndex: overlayZIndex }}
          />
        )}

        <Drawer.Content
          ref={contentRef}
          className={cn(
            "fixed bottom-0 left-0 right-0 flex outline-none",
            _type !== "floating" && "h-[100dvh]",
            contentClassName,
          )}
          style={{ zIndex: contentZIndex }}
        >
          <div
            className="flex w-full flex-col transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
            style={{
              height:
                _type === "floating"
                  ? "auto"
                  : isPill && _type === "morphing"
                    ? visibleHeight
                    : "100%",
            }}
          >
            {/* Invisible spacer that pushes the morphing pill down */}
            {_type === "morphing" && (
              <div
                className="pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
                style={{
                  flexGrow: isPill ? 1 : 0,
                  flexBasis: isPill ? "auto" : "0px",
                  minHeight: 0,
                }}
              />
            )}

            <div
              className={cn(
                "mx-auto flex w-full flex-col transition-[max-width,border-radius,margin,padding] duration-300",
                isPill
                  ? "border-foreground/10 rounded-4xl mb-4 max-h-[calc(100svh-2rem)] max-w-[calc(100%-2rem)] overflow-hidden border"
                  : "border-foreground/10 max-w-full overflow-hidden rounded-t-[32px] border",
                frostedGlass ? "frosted-glass" : "bg-panel",
                (_type === "floating" || !isPill) &&
                  "max-h-full min-h-0 flex-1",
              )}
              style={{
                paddingBottom:
                  keyboardOffset > 0 ? `${keyboardOffset}px` : "0px",
              }}
            >
              <div
                onClick={() => {
                  if (wasDraggingRef.current) return;
                  if (isPill) {
                    setIsAnimating(true);
                    setSnap(snapPoints?.[1] ?? null);
                    setTimeout(() => setIsAnimating(false), 500);
                  }
                }}
                className={cn(
                  "flex w-full flex-col",
                  (_type === "floating" || !isPill) && "h-full min-h-0 flex-1",
                )}
              >
                <div className="relative shrink-0 px-6 pb-2">
                  {showHandle && (
                    <Drawer.Handle className="!bg-foreground/50 mt-2 !w-14" />
                  )}

                  <div className={cn(showHandle && "mt-2")}>
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

                  {_type !== "morphing" && (
                    <div className="absolute right-4 top-3 z-10">
                      <ActionButton
                        buttonStyle="frosted glass"
                        icon={<Cross1Icon />}
                        aria-label="Close drawer"
                        onClick={(e) => {
                          e?.stopPropagation();
                          onOpenChange?.(false);
                          return true;
                        }}
                      />
                    </div>
                  )}
                </div>

                <div
                  className={cn(
                    "min-h-0 flex-1 px-7 transition-opacity duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                    scrollableBody && "overflow-y-auto",
                    bodyClassName,
                    isPill && _type === "morphing"
                      ? "pointer-events-none hidden pb-0 opacity-0"
                      : "pb-4 opacity-100",
                  )}
                  data-vaul-no-drag
                >
                  {children}
                </div>

                {footerContent && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                      "shrink-0 px-4 pt-2",
                      isPill && _type === "morphing" && "px-3 pb-3 pt-0",
                      !frostedGlass && "bg-panel",
                    )}
                  >
                    {footerContent}
                  </div>
                )}

                {/** Spacer for standard/morphing drawers to account for Vaul's shift */}
                {!isPill && scrollableBody && (
                  <div
                    className={cn("shrink-0 bg-transparent")}
                    style={{
                      height: "var(--drag-translate-y, 0px)",
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
