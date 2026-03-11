import { useEffect } from "react";

/**
 * This overrides vaul's natural handling of the resize event for snapPoints because
 * vaul's animations run on every resize event, which causes a visual jitter when
 * the user is actively sizing the window or when mobile Safari's dynamic bottom
 * bar is resizing. This was added mostly to offset problems caused by the latter.
 */
export function useDrawerResize() {
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const onResize = () => {
      document.body.classList.add("vaul-resizing");
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        document.body.classList.remove("vaul-resizing");
      }, 300);
    };

    const hasVisualViewport =
      typeof window !== "undefined" && !!window.visualViewport;
    if (hasVisualViewport) {
      window.visualViewport!.addEventListener("resize", onResize);
    } else {
      window.addEventListener("resize", onResize);
    }
    return () => {
      if (hasVisualViewport) {
        window.visualViewport!.removeEventListener("resize", onResize);
      } else {
        window.removeEventListener("resize", onResize);
      }
    };
  }, []);
}
