import { useEffect, useState } from "react";

export default function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const visualViewport = window.visualViewport;
    if (!visualViewport) return;

    const updateKeyboardHeight = () => {
      // The layout viewport height is window.innerHeight.
      // The visual viewport shrinks when the keyboard opens.
      const heightDiff = window.innerHeight - visualViewport.height;

      // Subtract offsetTop to account for the browser automatically panning
      // the page when an input is focused.
      const inset = Math.max(0, heightDiff - visualViewport.offsetTop);

      setKeyboardHeight(inset);
    };

    visualViewport.addEventListener("resize", updateKeyboardHeight);
    visualViewport.addEventListener("scroll", updateKeyboardHeight);

    // Initial check
    updateKeyboardHeight();

    return () => {
      visualViewport.removeEventListener("resize", updateKeyboardHeight);
      visualViewport.removeEventListener("scroll", updateKeyboardHeight);
    };
  }, []);

  return keyboardHeight;
}
