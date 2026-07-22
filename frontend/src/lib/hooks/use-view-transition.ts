"use client";

import { useRouter } from "next/navigation";

export function useViewTransition() {
  const router = useRouter();

  const doViewTransition = (href: string, timeout: number = 3000) => {
    if (!document.startViewTransition) {
      router.push(href);
      return;
    }

    document.startViewTransition(() => {
      return new Promise<void>((resolve) => {
        const observer = new MutationObserver(() => {
          observer.disconnect();
          resolve();
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });

        router.push(href);

        setTimeout(() => {
          observer.disconnect();
          resolve();
        }, timeout);
      });
    });
  };

  return doViewTransition;
}
