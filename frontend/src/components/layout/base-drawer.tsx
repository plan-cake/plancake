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
  /** Optional button or element to render to the left of the title */
  headerAction?: React.ReactNode;
  /**
   * Whether to show the Vaul top drag handle. Defaults to true.
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
   * Whether to show an overlay behind the drawer when open. Defaults to true.
   * @default !frostedGlass && modal
   */
  showOverlay?: boolean;
}

export function BaseDrawer({
  open,
  onOpenChange,
  trigger,
  title,
  headerContent,
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
}: BaseDrawerProps) {
  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={snapPoints}
      modal={modal}
    >
      {trigger && <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>}

      <Drawer.Portal>
        {showOverlay && (
          <Drawer.Overlay
            className={cn(
              "fixed inset-0 z-40",
              frostedGlass ? "bg-black/1" : "bg-black/30",
            )}
          />
        )}
        <Drawer.Content
          className={cn(
            "rounded-t-4xl fixed bottom-0 left-0 right-0 z-50 flex flex-col focus:outline-none",
            contentClassName,
            frostedGlass ? "" : "bg-panel",
          )}
        >
          {frostedGlass && (
            <div
              className={cn(
                "rounded-t-4xl absolute -bottom-12 left-0 right-0 top-0 -z-10 border-t shadow-lg",
                "frosted-glass",
              )}
            />
          )}
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col overflow-hidden">
            {showHandle && (
              <Drawer.Handle className="!bg-foreground/50 mx-auto mt-2 !w-14" />
            )}
            <div className="shrink-0 px-8 pb-4 pt-4">
              {(title || headerAction || headerContent) && (
                <div className="flex items-center gap-4">
                  {headerAction}

                  {headerContent ? (
                    <>
                      <Drawer.Title className="sr-only">{title}</Drawer.Title>
                      <div className="flex-1">{headerContent}</div>
                    </>
                  ) : (
                    <Drawer.Title className="mb-0 flex-1 text-lg font-semibold">
                      {title}
                    </Drawer.Title>
                  )}
                </div>
              )}

              <Drawer.Description className="sr-only">
                {description}
              </Drawer.Description>
            </div>

            <div
              className={cn(
                "flex-1 px-8 pb-8",
                scrollableBody && "overflow-y-auto",
                bodyClassName,
              )}
            >
              {children}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
