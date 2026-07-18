"use client";

import { useCallback, useEffect, useState } from "react";

import * as Toast from "@radix-ui/react-toast";

import BaseToast from "@/features/system-feedback/toast/base";
import { TOAST_CONFIG } from "@/features/system-feedback/toast/config";
import ToastContext from "@/features/system-feedback/toast/context";
import { ToastData, ToastOptions } from "@/features/system-feedback/toast/type";
import { ToastType } from "@/features/system-feedback/type";
import useCheckMobile from "@/lib/hooks/use-check-mobile";
import { cn } from "@/lib/utils/classname";

export default function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useCheckMobile();

  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [isHoveringViewport, setIsHoveringViewport] = useState(false);

  // handles a keyboard height adjustment to ensure toasts are not covered
  // by the keyboard on mobile devices
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  useEffect(() => {
    if (!window.visualViewport) return;

    const handleResize = () => {
      const viewport = window.visualViewport;

      if (!viewport) {
        setKeyboardHeight(0);
        return;
      }

      const offset = window.innerHeight - viewport.height;

      setKeyboardHeight(offset);
    };

    window.visualViewport?.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize);
    };
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, options?: ToastOptions) => {
      // check the local storage key to see if we should show the toast
      // if the key exists, do not show the toast and return -1 as the id
      if (options?.localStorageKey) {
        if (
          typeof window !== "undefined" &&
          window.localStorage.getItem(options.localStorageKey)
        ) {
          return -1;
        }
      }

      const id = Date.now() + Math.random();

      // handle onDismiss to set local storage key if provided
      // and call the original onDismiss if provided
      const handleDismiss = () => {
        if (options?.localStorageKey && typeof window !== "undefined") {
          window.localStorage.setItem(options.localStorageKey, "true");
        }
        options?.onDismiss?.();
      };

      // create new toast data
      const newToast: ToastData = {
        id,
        type,
        message,
        open: true,
        title: options?.title ?? TOAST_CONFIG[type].title,
        isPersistent: options?.isPersistent ?? false,
        onDismiss: handleDismiss,
        duration: options?.duration,
        localStorageKey: options?.localStorageKey,
      };

      setToasts((prev) => [...prev, newToast]);
      return id;
    },
    [],
  );

  const removeToast = useCallback(
    (id: number) => {
      if (id === -1) return;

      setToasts((prevToasts) =>
        prevToasts.map((t) => (t.id === id ? { ...t, open: false } : t)),
      );

      setTimeout(
        () => {
          setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
        },
        isMobile ? 100 : 250,
      );
    },
    [isMobile],
  );

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      <Toast.Provider swipeDirection={isMobile ? "up" : "right"}>
        {children}

        <Toast.Viewport
          onMouseEnter={() => setIsHoveringViewport(true)}
          onMouseLeave={() => setIsHoveringViewport(false)}
          style={{
            // adjust the position of the toast viewport based on keyboard height
            transform: isMobile
              ? undefined
              : `translateY(-${keyboardHeight}px)`,
            transition: "transform 0.2s ease-out",
          }}
          className={cn(
            "fixed z-[2147483647]",
            "m-0 list-none outline-none [--viewport-padding:_25px]",
            isMobile
              ? cn(
                  "left-0 right-0 top-0",
                  "px-[var(--viewport-padding)] pt-[var(--viewport-padding)]",
                )
              : cn(
                  "bottom-0 right-0",
                  "flex flex-col items-end",
                  "space-y-1 pb-[var(--viewport-padding)] pr-[var(--viewport-padding)]",
                ),
          )}
        >
          {toasts.map((toast, index) => {
            const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
            const Icon = config.icon;
            const stackIndex = toasts.length - index - 1;

            return (
              <BaseToast
                key={toast.id}
                open={toast.open}
                backgroundColor={config.background}
                textColor={config.textColor}
                title={toast.title}
                message={toast.message}
                icon={<Icon className="col-start-1 row-span-2 h-5 w-5" />}
                isPersistent={toast.isPersistent}
                duration={toast.duration}
                isPaused={isHoveringViewport || (isMobile && stackIndex > 0)}
                onOpenChange={(isOpen) => {
                  if (!isOpen) {
                    if (toast.onDismiss) {
                      toast.onDismiss();
                    }
                    removeToast(toast.id);
                  }
                }}
                stackIndex={stackIndex}
              />
            );
          })}
        </Toast.Viewport>
      </Toast.Provider>
    </ToastContext.Provider>
  );
}
