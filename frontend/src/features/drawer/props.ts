import { ReactNode } from "react";

export type DrawerType = "standard" | "floating" | "morphing";

type BaseDrawerProps = {
  /** Drawer open states */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Trigger element to open the drawer
   * If not provided, the drawer should be controlled externally via the `open` prop.
   */
  trigger?: ReactNode;
  /**
   * Title for the drawer (string or inline nodes only).
   * Required for accessibility (used in Drawer.Title).
   * If `headerContent` is provided, this will be visually hidden.
   */
  title: ReactNode;
  /**
   * Custom header content rendered outside the Drawer.Title heading element.
   * Ideal for complex layouts that would otherwise cause invalid HTML.
   */
  headerContent?: ReactNode;
  /** Description for accessibility (will be visually hidden) */
  description: string;
  /* Main content of the drawer */
  children: ReactNode;
  /** Class to apply to the content container (e.g., 'h-1/2' or 'h-[500px]') */
  contentClassName?: string;
  /** Class to apply to the inner body container wrapping the children */
  bodyClassName?: string;
  /**
   * Whether the drawer body should handle scrolling automatically.
   * Set to false if you are managing scrolling inside the children.
   * @default true
   */
  scrollableBody?: boolean;
  /**
   * Whether to show the Vaul top drag handle.
   * @default true
   */
  showHandle?: boolean;
  /**
   * Whether to apply a frosted glass effect to the drawer background
   * @default false
   */
  frostedGlass?: boolean;
  /**
   * Whether the drawer should be a modal (i.e., trap focus and prevent
   * interaction with background)
   * @default true
   * */
  modal?: boolean;
  /**
   * Whether to show an overlay behind the drawer when open.
   * @default !frostedGlass && modal
   */
  showOverlay?: boolean;
  /**
   * The nesting level of the drawer.
   * - `false` or `0`: Base level drawer.
   * - `true`: First level nested drawer (Level 1).
   * - `number`: Deeply nested drawers (Level 2, 3, etc.).
   * @default false
   */
  nested?: boolean | number;
};

export type StandardDrawerProps = BaseDrawerProps & {
  /**
   * The type of drawer, which can determine it's behavior and appearance:
   * - `standard`: A regular drawer that stretches full width and slides in from
   * the bottom of the screen.
   */
  _type?: "standard";
  /** Optional content to render in the drawer footer, outside of the scrollable body */
  footerContent?: ReactNode;

  /** Snap point logic */
  snapPoints?: (number | string)[];
  activeSnapPoint?: number | string | null;
  setActiveSnapPoint?: (snap: number | string | null) => void;
};

export type MorphingDrawerProps = BaseDrawerProps & {
  /**
   * The type of drawer, which can determine it's behavior and appearance:
   * - `morphing`: A drawer that morphs between a pill and a full-width drawer based
   * on the active snap point. At the lowest snap point, it is a pill.
   */
  _type: "morphing";
  /** Optional content to render in the drawer footer, outside of the scrollable body */
  footerContent?: ReactNode;
  /**
   * Optional alternative header content to display ONLY when the drawer is in its pill form.
   * If not provided, it falls back to `headerContent` or `title`.
   */
  pillHeaderContent?: ReactNode;
  /**
   * When true, the drawer will visually "float" at the lowest snap point instead
   * of stretching full width
   * @default false
   * */
  floatingAtLowestSnap?: boolean;

  /** Snap point logic */
  snapPoints?: (number | string)[];
  activeSnapPoint?: number | string | null;
  setActiveSnapPoint?: (snap: number | string | null) => void;
};

export type FloatingDrawerProps = BaseDrawerProps & {
  /**
   * The type of drawer, which can determine it's behavior and appearance:
   * - `floating`: A drawer that visually floats and always shows the pill header.
   */
  _type: "floating";
  /**
   * Optional alternative header content to display ONLY when the drawer is in its pill form.
   * If not provided, it falls back to `headerContent` or `title`.
   */
  pillHeaderContent?: ReactNode;
};

export type DrawerProps =
  | StandardDrawerProps
  | MorphingDrawerProps
  | FloatingDrawerProps;
