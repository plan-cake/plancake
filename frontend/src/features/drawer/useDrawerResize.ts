import { useEffect } from "react";

/**
 * This overrides vaul's natual handing of the resize event for snapPoints because
 * vaul's animations run on every resize event, which causes a visual jitter when
 * the user is actively sizing the window or when mobile Safari's dynamic bottom
 * bar is resizing. This was added mostly to offest problems caused by the latter.
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

    window.visualViewport?.addEventListener("resize", onResize);
    return () => {
      window.visualViewport?.removeEventListener("resize", onResize);
      clearTimeout(timeout);
      document.body.classList.remove("vaul-resizing");
    };
  }, []);
}
