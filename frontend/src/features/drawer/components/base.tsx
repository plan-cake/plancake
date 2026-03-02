import { Drawer } from "vaul";

import { SharedDrawerProps } from "@/features/drawer/props";
import { useDrawerResize } from "@/features/drawer/useDrawerResize";
import { cn } from "@/lib/utils/classname";

export interface StandardDrawerProps extends SharedDrawerProps {
  snapPoints?: (number | string)[];
  activeSnapPoint?: number | string | null;
  setActiveSnapPoint?: (snap: number | string | null) => void;
}

export function BaseDrawer({
  open,
  onOpenChange,
  trigger,
  title,
  headerContent,
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
}: StandardDrawerProps) {
  useDrawerResize();
  const DrawerComponent = nested ? Drawer.NestedRoot : Drawer.Root;

  return (
    <DrawerComponent
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={snapPoints}
      modal={modal}
      activeSnapPoint={activeSnapPoint}
      setActiveSnapPoint={setActiveSnapPoint}
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
              "fixed bottom-0 left-0 right-0 z-[60] w-full shrink-0 px-4 transition-transform duration-300",
              !frostedGlass && "bg-panel",
              open ? "translate-y-0" : "translate-y-full",
            )}
          >
            {footerContent}
          </div>
        )}

        <Drawer.Content
          className={cn(
            "fixed bottom-0 left-0 right-0 flex h-[100svh] flex-col bg-transparent outline-none transition-all duration-300",
            nested ? "z-[100]" : "z-50",
            contentClassName,
          )}
        >
          <div
            className={cn(
              "border-foreground/10 mx-auto flex h-full w-full max-w-full flex-col overflow-hidden rounded-t-[32px] border shadow-none",
              frostedGlass ? "frosted-glass" : "bg-panel",
            )}
          >
            {/* The flex-col fix is applied here */}
            <div className="flex h-full w-full flex-col">
              <div className="shrink-0 px-8">
                {showHandle && (
                  <Drawer.Handle className="!bg-foreground/50 mx-auto mt-2 !w-14" />
                )}
                <div className={cn(showHandle && "mt-1")}>
                  {(title || headerContent) && (
                    <div className="flex items-center">
                      {headerContent ? (
                        <>
                          <Drawer.Title className="sr-only">
                            {title}
                          </Drawer.Title>
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
              </div>

              <div
                className={cn(
                  "flex-1 px-8",
                  footerContent ? "pb-28" : "pb-4",
                  scrollableBody && "overflow-y-auto",
                  bodyClassName,
                )}
              >
                {children}
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </DrawerComponent>
  );
}
