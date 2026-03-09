import { createContext, useContext } from "react";

import { HeaderHeightClass, HeaderMarginClass } from "@/features/header/type";

export const HeaderSizeContext = createContext<{
  isShrunk: boolean;
  heightClass: HeaderHeightClass;
  topMarginClass: HeaderMarginClass;
  shrink: () => void;
  expand: () => void;
}>({
  isShrunk: false,
  heightClass: "h-25",
  topMarginClass: "top-25",
  shrink: () => { },
  expand: () => { },
});

export function useHeaderSize() {
  const context = useContext(HeaderSizeContext);
  if (!context) {
    throw new Error("useHeaderSize must be used within an HeaderSizeProvider");
  }
  return context;
}

export default HeaderSizeContext;
