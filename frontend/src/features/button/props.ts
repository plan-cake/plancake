import { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonStyle =
  | "primary"
  | "secondary"
  | "frosted glass"
  | "frosted glass inset"
  | "semi-transparent"
  | "transparent"
  | "danger";

export type BaseButtonProps = {
  /** The HTML button type. Defaults to "button". */
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  /**
   * The style of the button.
   * - `primary`: An important button, filled with the main accent color.
   * - `secondary`: A less important button, outlined with the main accent color.
   * - `frosted glass`: A button with a frosted glass appearance.
   * - `frosted glass inset`: A button with the style of a frosted glass inset element.
   * - `semi-transparent`: A button with a semi-transparent background.
   * - `transparent`: A button with no background until hovered.
   * - `danger`: A button style used for destructive actions, filled with a red color.
   *
   * `transparent` buttons cannot have icons.
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
   * If specified, the button will be a link. A link button uses the Next.js `Link`
   * component, and must have an `href` prop.
   */
  isLink?: boolean;
  /**
   * The URL to navigate to when the button is clicked. Required for link buttons, and
   * must not be provided for non-link buttons.
   */
  href?: string;
  /**
   * The function to call when the button is clicked. Required for non-link buttons, and
   * must not be provided for link buttons.
   *
   * The function must return a boolean or a Promise that resolves to a boolean,
   * indicating whether the action was successful.
   */
  onClick?: () => Promise<boolean> | boolean;
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
  loading?: boolean;
  /** @inheritdoc BaseButtonProps */
  disabled?: boolean;
  /** @inheritdoc BaseButtonProps */
  className?: string;
};

export type ActionButtonProps = CommonButtonProps & {
  /** @inheritdoc BaseButtonProps */
  onClick: () => Promise<boolean> | boolean;
  /** @inheritdoc BaseButtonProps */
  loadOnSuccess?: boolean;
};

export type LinkButtonProps = CommonButtonProps & {
  /** @inheritdoc BaseButtonProps */
  href: string;
};
