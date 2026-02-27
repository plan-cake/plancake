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
  /** Title to display in the drawer header */
  title?: React.ReactNode;
  /** Description for accessibility (will be visually hidden) */
  description?: string;
  /* Main content of the drawer */
  children: React.ReactNode;
  /** Array of snap points (e.g., [0.5, 1]) */
  snapPoints?: number[];
  /** Class to apply to the content container (e.g., 'h-1/2' or 'h-[500px]') */
  contentClassName?: string;
  /** Optional button or element to render to the left of the title */
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
}

export function BaseDrawer({
  open,
  onOpenChange,
  trigger,
  title,
  description = "Drawer contents",
  children,
  snapPoints,
  contentClassName,
  headerAction,
  showHandle = true,
  frostedGlass = false,
  modal = true,
  // By default, show overlay unless frostedGlass is enabled or if it's not a modal
  showOverlay = !frostedGlass && modal,
  floatingAtLowestSnap = false,
}: BaseDrawerProps) {
  const [snap, setSnap] = useState<number | string | null>(
    snapPoints?.[0] ?? null,
  );
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
  const isPill = isLowestSnap && !isDragging;

  return (
    <Drawer.Root
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

      {showOverlay && (
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/30" />
      )}

      <Drawer.Portal>
        <Drawer.Content
          onPointerDown={() => setIsDragging(true)}
          onPointerUp={() => setIsDragging(false)}
          onPointerCancel={() => setIsDragging(false)}
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50 flex h-[100dvh] flex-col bg-transparent outline-none",
            contentClassName,
          )}
        >
          <div
            className={cn(
              "mx-auto flex w-full flex-col overflow-hidden",
              "pb-[env(safe-area-inset-bottom)]",
              "transition-[max-width,border-radius,box-shadow] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
              isPill
                ? "max-w-[calc(100%-2rem)] rounded-[40px] border border-white/10"
                : "max-w-full rounded-t-[32px] border-transparent shadow-none",
              frostedGlass ? "" : "bg-panel",
            )}
            style={{
              height: isPill
                ? "calc(60px + env(safe-area-inset-bottom))"
                : "100%",
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
            <div className="shrink-0 px-8 pb-4">
              {showHandle && (
                <Drawer.Handle className="!bg-foreground/50 mx-auto mt-2 !w-14" />
              )}
              {(title || headerAction) && (
                <div className="flex items-center gap-4 pt-1">
                  {headerAction}
                  <Drawer.Title className="mb-0 flex-1 text-lg font-semibold">
                    {title}
                  </Drawer.Title>
                </div>
              )}

              <Drawer.Description className="sr-only">
                {description}
              </Drawer.Description>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-8">{children}</div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
