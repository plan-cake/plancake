export interface SharedDrawerProps {
  /** Drawer open states */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Trigger element to open the drawer
   * If not provided, the drawer should be controlled externally via the `open` prop.
   */
  trigger?: React.ReactNode;
  /**
   * Title for the drawer (string or inline nodes only).
   * Required for accessibility (used in Drawer.Title).
   * If `headerContent` is provided, this will be visually hidden.
   */
  title: React.ReactNode;
  /**
   * Custom header content rendered outside the Drawer.Title heading element.
   * Ideal for complex layouts that would otherwise cause invalid HTML.
   */
  headerContent?: React.ReactNode;
  /**
   * Optional alternative header content to display ONLY when the drawer is in its pill form.
   * If not provided, it falls back to `headerContent` or `title`.
   */
  pillHeaderContent?: React.ReactNode;
  /** Optional content to render in the drawer footer, outside of the scrollable body */
  footerContent?: React.ReactNode;
  /** Description for accessibility (will be visually hidden) */
  description: string;
  /* Main content of the drawer */
  children: React.ReactNode;
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
   * When true, the drawer will visually "float" at the lowest snap point instead
   * of stretching full width
   * @default false
   * */
  floatingAtLowestSnap?: boolean;
  /**
   * Whether this drawer is nested inside another drawer.
   * @default false
   */
  nested?: boolean;
}
