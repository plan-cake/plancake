import { useEffect, useRef } from "react";

import { Cross2Icon } from "@radix-ui/react-icons";
import * as Toast from "@radix-ui/react-toast";

import ProgressBar from "@/features/system-feedback/toast/progress-bar";
import { cn } from "@/lib/utils/classname";

type BaseToastProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string | undefined;
  message: string;
  icon: React.ReactNode;
  backgroundColor?: string;
  textColor?: string;
  duration?: number;
  isPersistent?: boolean;
  isPaused: boolean;
};

export default function BaseToast({
  open,
  onOpenChange,
  title,
  message,
  icon,
  backgroundColor,
  textColor,
  duration = 5000,
  isPersistent = false,
  isPaused,
}: BaseToastProps) {
  // Whenever the viewport hover state changes, the toast provider rerenders
  // all toasts, which means that all toast durations will get reset. In order
  // to prevent that, each toast will manually manage its own duration timer.
  const remainingTime = useRef(duration);
  const startTime = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPersistent || !open) return;

    if (!isPaused) {
      startTime.current = Date.now();
      timerRef.current = setTimeout(() => {
        onOpenChange(false);
      }, remainingTime.current);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;

        if (!isPaused) {
          const elapsed = Date.now() - startTime.current;
          remainingTime.current = Math.max(0, remainingTime.current - elapsed);
        }
      }
    };
  }, [isPaused, open, isPersistent, onOpenChange]);

  return (
    <Toast.Root
      className={cn(
        "rounded-4xl group relative grid max-w-sm grid-cols-[auto_1fr_auto] items-center gap-x-4 overflow-hidden px-4 py-3 shadow-xl",
        "data-[state=closed]:animate-slideOut data-[state=open]:animate-slideIn data-[swipe=end]:animate-swipeOut data-[swipe=cancel]:translate-x-0 data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:transition-[transform_200ms_ease-out]",
      )}
      style={{
        backgroundColor: `var(--color-${backgroundColor})`,
        color: `var(--color-${textColor})`,
      }}
      open={open}
      onOpenChange={onOpenChange}
      duration={Infinity}
    >
      {!isPersistent && (
        <ProgressBar
          duration={duration}
          backgroundColor={backgroundColor}
          isPaused={isPaused}
        />
      )}

      <div className="z-10 flex items-center justify-center">{icon}</div>

      <div className="z-10 flex flex-col gap-1">
        <Toast.Title className="text-sm font-semibold leading-none">
          {title}
        </Toast.Title>
        <Toast.Description className="text-sm leading-snug opacity-90">
          {message}
        </Toast.Description>
      </div>

      <Toast.Close asChild>
        <button
          type="button"
          aria-label="Close"
          onClick={() => {
            if (
              document.activeElement &&
              document.activeElement instanceof HTMLElement
            ) {
              document.activeElement.blur();
            }
          }}
          className={cn(
            "z-10 col-start-3 row-span-2 flex h-6 w-6 items-center justify-center rounded-full",
            "hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-white/50",
            !isPersistent &&
              "opacity-0 focus-visible:opacity-100 group-hover:opacity-100",
          )}
        >
          <Cross2Icon className="h-4 w-4" />
        </button>
      </Toast.Close>
    </Toast.Root>
  );
}
