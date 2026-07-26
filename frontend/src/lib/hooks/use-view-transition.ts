"use client";

import { useRouter } from "next/navigation";

export function useViewTransition() {
  const router = useRouter();

  const doViewTransition = (
    href: string,
    targetSelector?: string,
    timeout: number = 3000,
  ) => {
    if (!document.startViewTransition) {
      router.push(href);
      return;
    }

    const currentPath = window.location.pathname;
    const previousTarget = targetSelector
      ? document.querySelector(targetSelector)
      : null;

    const transition = document.startViewTransition(() => {
      return new Promise<void>((resolve, reject) => {
        const observer = new MutationObserver(() => {
          // Don't resolve if the page hasn't changed yet
          if (window.location.pathname === currentPath) return;

          if (targetSelector) {
            // Only resolve if the target element has mounted, bypassing loading.tsx
            const target = document.querySelector(targetSelector);
            if (target && target !== previousTarget) {
              observer.disconnect();
              clearTimeout(timer);
              resolve();
            }
          } else {
            // Resolve on any mutation if no selector is provided
            observer.disconnect();
            clearTimeout(timer);
            resolve();
          }
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });

        router.push(href);

        const timer = setTimeout(() => {
          observer.disconnect();
          // This aborts the view transition, showing the loading skeleton instead
          reject();
        }, timeout);
      });
    });

    // Catch the rejection promises
    transition.ready.catch(() => {});
    transition.finished.catch(() => {});
  };

  return doViewTransition;
}
