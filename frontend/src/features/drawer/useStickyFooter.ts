import { useEffect } from "react";

export function useVaulStickyFooter(
  contentRef: React.RefObject<HTMLDivElement | null>,
  isDragging: boolean,
) {
  useEffect(() => {
    const contentEl = contentRef.current;
    if (!contentEl) return;

    const syncTransform = () => {
      const transform = contentEl.style.transform;
      if (transform) {
        // Vaul outputs `translate3d(0, <Y>px, 0)` during drag/snap
        const yMatch = transform.match(/translate3d\([^,]+,\s*([-0-9.]+)px/);
        if (yMatch) {
          // Set variable on the PARENT so any child instantly inherits it
          contentEl.style.setProperty("--drag-translate-y", `${yMatch[1]}px`);
          return;
        }
      }
      contentEl.style.setProperty("--drag-translate-y", "0px");
    };

    // Run immediately to catch the current state
    syncTransform();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === "style") syncTransform();
      }
    });

    observer.observe(contentEl, {
      attributes: true,
      attributeFilter: ["style"],
    });

    return () => observer.disconnect();
  }, [isDragging, contentRef]);
}
