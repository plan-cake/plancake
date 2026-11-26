import { useEffect, useState } from "react";

export default function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const visualViewport = window.visualViewport;
    if (!visualViewport) return;

    const updateKeyboardHeight = () => {
      // This used to compare against innerHeight, which iOS Safari sometimes would shrink
      // along with the keyboard, causing the keyboard to seem 0px tall. Instead,
      // comparing against clientHeight avoids this issue.
      const heightDiff =
        document.documentElement.clientHeight - visualViewport.height;

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
