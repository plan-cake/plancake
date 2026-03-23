export type Option<TValue extends string | number> = {
  label: string;
  value: TValue;
};

export type BaseSelectorProps<TValue extends string | number> = {
  /**
   * Unique identifier for the selector, used for accessibility and testing purposes
   *
   * @type string
   */
  id: string;
  /**
   * Callback function that is called when the selected value changes.
   *
   * @type (value: TValue) => void
   */
  onChange: (value: TValue) => void;
  /**
   * The currently selected value.
   *
   * @type string | number
   */
  value: TValue;
  /**
   * Array of options that the user can select from. Each option has a label and a value.
   *
   * @type Option<TValue>[]
   * @example [{ label: "Option 1", value: "option1" }, { label: "Option 2", value: "option2" }]
   */
  options: Option<TValue>[];
  /**
   * Whether the selector is disabled.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * Additional CSS classes to apply to the selector component for custom styling.
   */
  className?: string;
};

/* EXTENDED FROM BASE PROPS */

export type DropdownProps<TValue extends string | number> =
  BaseSelectorProps<TValue>;

export type DrawerProps<TValue extends string | number> =
  BaseSelectorProps<TValue> & {
    /**
     * Title to display at the top of the drawer when the selector is open.
     * Required for accessibility to provide context for screen readers.
     */
    dialogTitle: string;
    /**
     * Description to display below the title in the drawer.
     * Required for accessibility to provide context for screen readers.
     */
    dialogDescription: string;
    /**
     * Whether to align the text to the start of the button instead of centering it.
     *
     * @default false
     */
    textStart?: boolean;
    /**
     * Whether this drawer is being used as a nested drawer within another drawer.
     * If the drawer is nested, it will adjust styling to become a floating drawer
     * instead of a regular bottom sheet drawer.
     *
     * The nesting level of the drawer.
     * - `false` or `0`: Base level drawer.
     * - `true`: First level nested drawer (Level 1).
     * - `number`: Deeply nested drawers (Level 2, 3, etc.).
     *
     * @default false
     */
    drawerNesting?: boolean | number;
    /**
     * Controlled open state for the drawer.
     */
    open?: boolean;
    /**
     * Callback function that is called when the open state of the drawer changes.
     */
    onOpenChange?: (open: boolean) => void;
    /**
     * Optional custom trigger element to open the drawer.
     * 
     * If not provided, the default will be used.
     */
    trigger?: React.ReactNode;
  };

/**
 * MAIN SELECTOR PROP TYPE
 *
 * Uses the same props for both Dropdown and Drawer variants since they share the
 * same core functionality and only differ in presentation. Based off of DrawerProps
 * since it is the more complex variant.
 */
export type SelectorProps<TValue extends string | number> = DrawerProps<TValue>;

/**
 * Base props for the selector components.
 *
 * This type omits options, dialogTitle, and dialogDescription since they should be
 * provided by the parent component (e.g. TimeZoneSelector).
 */
export type BaseSelectorWrapperProps<TValue extends string | number> = Omit<
  SelectorProps<TValue>,
  "options" | "dialogTitle" | "dialogDescription"
>;
