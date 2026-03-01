import { useState, useEffect } from "react";

import { Drawer } from "vaul";

import { cn } from "@/lib/utils/classname";

export interface BaseDrawerProps {
  /** Drawer open states */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Trigger element to open the drawer
   * If not provided, the drawer should be controlled externally via the `open` prop.
   */
  trigger?: React.ReactNode;
  /**
   * Title for the drawer (string or inline nodes only).
   * Required for accessibility (used in Drawer.Title).
   * If `headerContent` is provided, this will be visually hidden.
   */
  title: React.ReactNode;
  /**
   * Custom header content rendered outside the Drawer.Title heading element.
   * Ideal for complex layouts that would otherwise cause invalid HTML.
   */
  headerContent?: React.ReactNode;
  /**
   * Optional alternative header content to display ONLY when the drawer is in its pill form.
   * If not provided, it falls back to `headerContent` or `title`.
   */
  pillHeaderContent?: React.ReactNode;
  /** Optional content to render in the drawer footer, outside of the scrollable body */
  footerContent?: React.ReactNode;
  /** Description for accessibility (will be visually hidden) */
  description: string;
  /* Main content of the drawer */
  children: React.ReactNode;
  /** Array of snap points (e.g., [0.5, 1]) */
  snapPoints?: number[];
  /** Class to apply to the content container (e.g., 'h-1/2' or 'h-[500px]') */
  contentClassName?: string;
  /** Class to apply to the inner body container wrapping the children */
  bodyClassName?: string;
  /**
   * Whether the drawer body should handle scrolling automatically.
   * Set to false if you are managing scrolling inside the children.
   * @default true
   */
  scrollableBody?: boolean;
  /** Optional button or element to render to the right of the title */
  headerAction?: React.ReactNode;
  /**
   * Whether to show the Vaul top drag handle.
   * @default true
   */
  showHandle?: boolean;
  /**
   * Whether to apply a frosted glass effect to the drawer background
   * @default false
   */
  frostedGlass?: boolean;
  /**
   * Whether the drawer should be a modal (i.e., trap focus and prevent
   * interaction with background)
   * @default true
   * */
  modal?: boolean;
  /**
   * Whether to show an overlay behind the drawer when open.
   * @default !frostedGlass && modal
   */
  showOverlay?: boolean;
  /**
   * When true, the drawer will visually "float" at the lowest snap point instead
   * of stretching full width
   * @default false
   * */
  floatingAtLowestSnap?: boolean;
  /**
   * Whether this drawer is nested inside another drawer.
   * @default false
   */
  nested?: boolean;
  activeSnapPoint?: number | string | null;
  setActiveSnapPoint?: (snap: number | string | null) => void;
  /** Forces the drawer to always display as a floating pill */
  forcePill?: boolean;
}

export function BaseDrawer({
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
  headerAction,
  showHandle = true,
  frostedGlass = false,
  modal = true,
  // By default, show overlay unless it's not a modal
  showOverlay = modal,
  floatingAtLowestSnap = false,
  nested = false,
  activeSnapPoint,
  setActiveSnapPoint,
  forcePill = false,
}: BaseDrawerProps) {
  const [internalSnap, setInternalSnap] = useState<number | string | null>(
    snapPoints?.[0] ?? null,
  );

  const snap = activeSnapPoint !== undefined ? activeSnapPoint : internalSnap;
  const setSnap = setActiveSnapPoint ?? setInternalSnap;
  const [isDragging, setIsDragging] = useState(false);

  /**
   * This overrides vaul's natual handing of the resize event for snapPoints because
   * vaul's animations run on every resize event, which causes a visual jitter when
   * the user is actively sizing the window or when mobile Safari's dynamic bottom
   * bar is resizing. This was added mostly to offest problems caused by the latter.
   */
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const onResize = () => {
      document.body.classList.add("vaul-resizing");
      clearTimeout(timeout);

      // Safari's dynamic bar animation takes roughly 250ms.
      // Remove the class once the browser stops resizing.
      timeout = setTimeout(() => {
        document.body.classList.remove("vaul-resizing");
      }, 300);
    };

    window.visualViewport?.addEventListener("resize", onResize);
    return () => {
      window.visualViewport?.removeEventListener("resize", onResize);
      clearTimeout(timeout);
      document.body.classList.remove("vaul-resizing");
    };
  }, []);

  // if there are snapPoints and floatingAtLowestSnap is enabled, we want to set
  // the active snap to the lowest snap point when the drawer is opened
  const isLowestSnap =
    floatingAtLowestSnap &&
    snapPoints &&
    String(snap) === String(snapPoints[0]);
  const isCollapsedPill = isLowestSnap && !isDragging;
  const isPill = forcePill || isCollapsedPill;

  const activeHeaderContent =
    isPill && pillHeaderContent ? pillHeaderContent : headerContent;

  const DrawerComponent = nested ? Drawer.NestedRoot : Drawer.Root;

  // Calculate the exact exposed viewport height based on the current snap point
  const snapValue = typeof snap === "number" ? snap : parseFloat(String(snap));
  const isFraction = !isNaN(snapValue) && snapValue > 0 && snapValue <= 1;
  // const visibleHeight = isFraction ? `${snapValue * 100}svh` : snap || "auto";
  const visibleHeight = isFraction
    ? `calc(${snapValue * 100}svh + 8px)`
    : forcePill
      ? `${0.5 * 100}svh`
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
      dismissible={!modal}
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
                "mx-auto flex w-full flex-col overflow-hidden",
                "transition-[max-width,border-radius,box-shadow,margin] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                isPill
                  ? "mb-4 max-w-[calc(100%-2rem)] rounded-[40px] border border-white/10"
                  : "max-w-full rounded-t-[32px] border-transparent shadow-none",
                frostedGlass ? "" : "bg-panel",
              )}
              style={{
                height: isPill ? "auto" : "100%",
                maxHeight: isPill ? "none" : "100%",
              }}
            >
              {frostedGlass && (
                <div
                  className={cn(
                    "rounded-t-4xl absolute -bottom-12 left-0 right-0 top-0 -z-10 border-t shadow-lg",
                    "frosted-glass",
                  )}
                />
              )}

              <div
                onPointerDown={() => setIsDragging(true)}
                onPointerUp={() => setIsDragging(false)}
                onPointerCancel={() => setIsDragging(false)}
              >
                <div className="shrink-0 px-8">
                  {showHandle && (
                    <Drawer.Handle className="!bg-foreground/50 mx-auto mt-2 !w-14" />
                  )}

                  <div className={cn(showHandle && "mt-1")}>
                    {(title || headerAction || headerContent) && (
                      <div>
                        {activeHeaderContent || forcePill ? (
                          <>
                            <Drawer.Title className="sr-only">
                              {title}
                            </Drawer.Title>
                            <div className={cn(isPill ? "" : "flex-1")}>
                              {activeHeaderContent}
                            </div>
                          </>
                        ) : (
                          <Drawer.Title
                            className={cn(
                              "mb-0 text-lg font-semibold",
                              isPill ? "flex-none text-center" : "flex-1",
                            )}
                          >
                            {title}
                          </Drawer.Title>
                        )}
                        {!isCollapsedPill && headerAction}
                      </div>
                    )}

                    <Drawer.Description className="sr-only">
                      {description}
                    </Drawer.Description>
                  </div>
                </div>

                <div
                  className={cn(
                    "px-8",
                    footerContent && !isPill ? "pb-28" : "pb-4",
                    forcePill && "pt-4",
                    scrollableBody && "overflow-y-auto",
                    bodyClassName,
                    isCollapsedPill ? "hidden" : "flex-1",
                  )}
                >
                  {children}
                </div>
              </div>

              {footerContent && isCollapsedPill && (
                <div
                  className={cn(
                    "mt-auto shrink-0",
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
