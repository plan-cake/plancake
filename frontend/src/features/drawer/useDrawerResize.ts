import { useEffect } from "react";

// Module-level variables to track state across all instances of the hook
let listenerCount = 0;
let resizeTimeout: NodeJS.Timeout | null = null;

const handleResize = () => {
  document.body.classList.add("vaul-resizing");

  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }

  resizeTimeout = setTimeout(() => {
    document.body.classList.remove("vaul-resizing");
    resizeTimeout = null;
  }, 300);
};

export function useDrawerResize() {
  useEffect(() => {
    const target =
      typeof window !== "undefined" && window.visualViewport
        ? window.visualViewport
        : window;

    // Only attach the listener if this is the FIRST drawer being mounted
    if (listenerCount === 0 && typeof window !== "undefined") {
      target.addEventListener("resize", handleResize);
    }

    listenerCount++;

    return () => {
      listenerCount--;

      if (listenerCount === 0 && typeof window !== "undefined") {
        target.removeEventListener("resize", handleResize);

        if (resizeTimeout) {
          clearTimeout(resizeTimeout);
          resizeTimeout = null;
        }
        document.body.classList.remove("vaul-resizing");
      }
    };
  }, []);
}
