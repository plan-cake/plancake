import { ButtonHTMLAttributes, ReactNode } from "react";

import { Options } from "react-hotkeys-hook";

export type ButtonStyle =
  | "primary"
  | "secondary"
  | "frosted glass"
  | "frosted glass inset"
  | "bordered semi-transparent"
  | "semi-transparent"
  | "transparent"
  | "danger";

type ButtonType = "action" | "link" | "empty";

type HotkeyOptions = {
  /** The keyboard shortcut to trigger the button. */
  keys: string;
  /** Additional classNames to apply to the hotkey badge, for further customization. */
  baseClassName?: string;
  litClassName?: string;
  /** Additional options to pass to the useHotkeys hook. */
  options?: Options;
  /** If true, the hotkey badge will be hidden. */
  hideBadge?: boolean;
};

export type BaseButtonProps = {
  /**
   * The type of the button, determining its behavior and required props.
   * 
   * This is only used internally.
   */
  _buttontype: ButtonType;
  /** The HTML button type. Defaults to "button". */
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  /**
   * The style of the button.
   * - `primary`: An important button, filled with the main accent color.
   * - `secondary`: A less important button, outlined with the main accent color.
   * - `frosted glass`: A button with a frosted glass appearance.
   * - `frosted glass inset`: A button with the style of a frosted glass inset element.
   * - `bordered semi-transparent`: A button with a semi-transparent background and a
   *   border.
   * - `semi-transparent`: A button with a semi-transparent background.
   * - `transparent`: A button with no background until hovered.
   * - `danger`: A button style used for destructive actions, filled with a red color.
   */
  buttonStyle: ButtonStyle;
  /**
   * The icon to display in the button.
   *
   * Should not include a className prop for styling, since it will be overridden.
   */
  icon?: ReactNode;
  /**
   * The text label of the button.
   *
   * If `shrinkOnMobile` is `true`, the label will be hidden on small screens.
   */
  label?: string;
  /**
   * If `true`, the button will hide its label on small screens, showing only the icon.
   *
   * This prop requires both an icon and a label to be provided.
   * @default false
   */
  shrinkOnMobile?: boolean;
  /**
   * A tooltip to show when the button is hovered. This can be a simple string or a more
   * complex component for more detailed tooltips.
   *
   * This tooltip cannot be shown on devices without hover.
   */
  tooltip?: ReactNode;
  /**
   * If `true`, the button will show a loading spinner and be unclickable.
   *
   * Typically, the loading state is managed internally by the button when `onClick` is
   * provided. However, this can be helpful if a button shouldn't be accessible until
   * something else has loaded.
   * @default false
   */
  loading?: boolean;
  /**
   * Whether the button is disabled. A disabled button cannot be clicked and will have a
   * distinct style.
   * @default false
   */
  disabled?: boolean;
  /**
   * The URL to navigate to when the button is clicked. Required for Link buttons.
   */
  href?: string;
  /**
   * The function to call when the button is clicked. Required for Action buttons.
   *
   * The function should return a boolean or a Promise that resolves to a boolean if
   * `loadOnSuccess` is `true`, indicating whether the action was successful. Otherwise,
   * the function is always assumed to be successful.
   */
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => Promise<void | boolean> | void | boolean;
  /**
   * If specified, the button will stay in a loading state after a successful action. This
   * behavior should be used for buttons that trigger navigation, to avoid multiple clicks
   * before the new page loads.
   *
   * Otherwise, the button will return to a normal state no matter the result of
   * `onClick`.
   */
  loadOnSuccess?: boolean;
  /**
   * The keyboard shortcut to trigger the button. Action buttons will call their onClick
   * handler, while Link buttons will navigate to their href.
   * 
   * Additional props can be provided in for styling and other options to be passed to the
   * useHotkeys hook.
   */
  hotkey?: HotkeyOptions;
  /**
   * Additional className to apply to the button, for further customization.
   */
  className?: string;
};

type CommonButtonProps = {
  /** @inheritdoc BaseButtonProps */
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  /** @inheritdoc BaseButtonProps */
  buttonStyle: ButtonStyle;
  /** @inheritdoc BaseButtonProps */
  icon?: ReactNode;
  /** @inheritdoc BaseButtonProps */
  label?: string;
  /** @inheritdoc BaseButtonProps */
  shrinkOnMobile?: boolean;
  /** @inheritdoc BaseButtonProps */
  tooltip?: ReactNode;
  /** @inheritdoc BaseButtonProps */
  loading?: boolean;
  /** @inheritdoc BaseButtonProps */
  disabled?: boolean;
  /** @inheritdoc BaseButtonProps */
  className?: string;
};

export type ActionButtonProps = CommonButtonProps & {
  /** @inheritdoc BaseButtonProps */
  onClick: (e?: React.MouseEvent<HTMLButtonElement>) => Promise<void | boolean> | void | boolean;
  /** @inheritdoc BaseButtonProps */
  loadOnSuccess?: boolean;
  /** @inheritdoc BaseButtonProps */
  hotkey?: HotkeyOptions;
};

export type LinkButtonProps = CommonButtonProps & {
  /** @inheritdoc BaseButtonProps */
  href: string;
  /** @inheritdoc BaseButtonProps */
  hotkey?: HotkeyOptions;
};

export type EmptyButtonProps = CommonButtonProps;
