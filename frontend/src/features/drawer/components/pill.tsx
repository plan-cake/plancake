import { Drawer } from "vaul";

import { SharedDrawerProps } from "@/features/drawer/props";
import { useDrawerResize } from "@/features/drawer/useDrawerResize";
import { cn } from "@/lib/utils/classname";

export function PillDrawer({
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
  showOverlay = modal,
  nested = false,
}: SharedDrawerProps) {
  useDrawerResize();
  const DrawerComponent = nested ? Drawer.NestedRoot : Drawer.Root;

  return (
    <DrawerComponent open={open} onOpenChange={onOpenChange} modal={modal}>
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

        <Drawer.Content
          className={cn(
            "fixed bottom-0 left-0 right-0 flex outline-none",
            nested ? "z-[100]" : "z-50",
            contentClassName,
          )}
        >
          {/* Notice the simplified container specifically for the pill shape */}
          <div
            className={cn(
              "border-foreground/10 mx-auto mb-4 flex w-full max-w-[calc(100%-2rem)] flex-col overflow-hidden rounded-[40px] border",
              frostedGlass ? "frosted-glass" : "bg-panel",
            )}
          >
            <div className="flex h-full w-full flex-col">
              <div className="shrink-0 px-8">
                {showHandle && (
                  <Drawer.Handle className="!bg-foreground/50 mx-auto mt-2 !w-14" />
                )}
                <div className={cn(showHandle && "mt-1")}>
                  {(title || headerContent) && (
                    <div className="text-center">
                      {headerContent ? (
                        <>
                          <Drawer.Title className="sr-only">
                            {title}
                          </Drawer.Title>
                          {headerContent}
                        </>
                      ) : (
                        <Drawer.Title className="mb-0 text-lg font-semibold">
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
                  "flex-1 px-8 pb-4 pt-4",
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
