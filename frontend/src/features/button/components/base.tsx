"use client";

import {
  ReactElement,
  cloneElement,
  useEffect,
  useState,
  forwardRef,
} from "react";

import Link from "next/link";

import LoadingSpinner from "@/components/loading-spinner";
import { BaseButtonProps, ButtonStyle } from "@/features/button/props";
import { cn } from "@/lib/utils/classname";

type ButtonState = "rest" | "loading" | "disabled";

// Used for forwardRef when using libraries like Radix UI
type Ref = HTMLButtonElement | HTMLAnchorElement;

const BaseButton = forwardRef<Ref, BaseButtonProps>(
  (
    {
      type,
      buttonStyle,
      icon,
      label,
      shrinkOnMobile = false,
      loading = false,
      disabled = false,
      isLink = false,
      href,
      onClick,
      loadOnSuccess = false,
      className,
      ...props // for forwardRef
    },
    ref, // for forwardRef
  ) => {
    // validate props
    if (!icon && !label) throw new Error("Button must have an icon or a label");
    if (shrinkOnMobile && (!icon || !label))
      throw new Error(
        "Button cannot shrink on mobile without both an icon and a label",
      );
    if (isLink && !href) throw new Error("Link Button must specify href");
    if (!isLink && !onClick)
      throw new Error("Non-Link Button must specify onClick");
    if (buttonStyle === "transparent" && icon)
      throw new Error("Transparent Button cannot have an icon");

    const [isLoading, setIsLoading] = useState(loading);
    useEffect(() => {
      setIsLoading(loading);
    }, [loading]);

    const onClickHandler = async () => {
      if (isLoading) return;
      setIsLoading(true);
      const success = await onClick!();
      if (loadOnSuccess) {
        if (!success) {
          setIsLoading(false);
        }
        return;
      } else {
        setIsLoading(false);
      }
    };

    const baseClasses = cn(
      "text-nowrap rounded-full font-medium flex flex-row items-center gap-1 relative",
    );
    const focusClasses = cn(
      "group-focus-visible:rounded-full group-focus-visible:outline-2",
      "group-focus-visible:outline-offset-2 group-focus-visible:outline-foreground",
    );
    const loadingHideClass = isLoading ? "opacity-0" : "";
    const cursorClass = isLoading
      ? "cursor-default"
      : disabled
        ? "cursor-not-allowed"
        : "cursor-pointer";
    const buttonState = isLoading ? "loading" : disabled ? "disabled" : "rest";
    const [styleClasses, spinnerClasses] = getStyleClasses(
      buttonStyle,
      !!icon,
      !!label,
      buttonState,
      shrinkOnMobile,
    );
    const labelClass = shrinkOnMobile ? "hidden md:block" : "";

    // pretty ugly, but it allows the icon to be specified without a className for DRY
    // instead, we specify the styling (really just the size) here
    const iconComponent =
      icon &&
      cloneElement(icon as ReactElement<{ className: string }>, {
        className: cn("h-6 w-6 p-0.5", loadingHideClass),
      });

    const buttonContent = (
      <div
        className={cn(
          baseClasses,
          cursorClass,
          styleClasses,
          focusClasses,
          className,
        )}
      >
        {icon && iconComponent}
        {label && (
          <span className={cn(labelClass, loadingHideClass)}>{label}</span>
        )}
        {isLoading && (
          <LoadingSpinner
            className={cn("centered-absolute h-5 w-5", spinnerClasses)}
          />
        )}
      </div>
    );

    if (disabled || isLoading) {
      return (
        <button
          disabled
          type={type}
          ref={ref as React.Ref<HTMLButtonElement>}
          {...props}
        >
          {buttonContent}
        </button>
      );
    } else if (isLink) {
      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          {...props}
          className={"group focus:outline-none"}
          href={href!}
        >
          {buttonContent}
        </Link>
      );
    } else {
      return (
        <button
          type={type}
          ref={ref as React.Ref<HTMLButtonElement>}
          {...props}
          className={"group focus:outline-none"}
          onClick={onClickHandler}
        >
          {buttonContent}
        </button>
      );
    }
  },
);

BaseButton.displayName = "BaseButton";
export default BaseButton;

function getStyleClasses(
  style: ButtonStyle,
  hasIcon: boolean,
  hasLabel: boolean,
  state: ButtonState,
  shrinkOnMobile: boolean,
) {
  let paddingShrink = 0;
  let styleClasses;
  let spinnerClasses = "border-white";
  switch (style) {
    case "primary":
      switch (state) {
        case "rest":
          styleClasses = cn(
            "bg-accent text-white",
            "active:bg-[color-mix(in_oklab,var(--color-accent)_100%,black_10%)]",
            "hover:bg-[color-mix(in_oklab,var(--color-accent)_100%,white_10%)]",
          );
          break;
        case "loading":
          styleClasses =
            "bg-[color-mix(in_oklab,var(--color-accent)_100%,black_20%)]";
          break;
        case "disabled":
          styleClasses =
            "bg-gray-200 text-[#ffffff] dark:bg-gray-300/25 dark:text-gray-300";
          break;
      }
      break;
    case "secondary":
      switch (state) {
        case "rest":
          styleClasses =
            "border-accent hover:bg-accent/25 border-2 active:bg-accent/40";
          break;
        case "loading":
          styleClasses = "border-accent border-2 bg-accent/40";
          break;
        case "disabled":
          styleClasses =
            "border-gray-200 border-2 text-gray-300 dark:border-gray-400";
          break;
      }
      paddingShrink = 0.5;
      spinnerClasses = "border-foreground";
      break;
    case "frosted glass":
      switch (state) {
        case "rest":
          styleClasses = "frosted-glass frosted-glass-button";
          break;
        case "loading":
          styleClasses = "frosted-glass frosted-glass-button-loading";
          break;
        case "disabled":
          styleClasses = "frosted-glass text-violet/40 dark:text-white/40";
          break;
      }
      paddingShrink = 0.25;
      spinnerClasses = "border-foreground";
      break;
    case "frosted glass inset":
      switch (state) {
        case "rest":
          styleClasses = "frosted-glass-inset frosted-glass-inset-button";
          break;
        case "loading":
          styleClasses =
            "frosted-glass-inset frosted-glass-inset-button-loading";
          break;
        case "disabled":
          styleClasses =
            "frosted-glass-inset text-violet/40 dark:text-white/40";
          break;
      }
      spinnerClasses = "border-foreground";
      break;
    case "semi-transparent":
      switch (state) {
        case "rest":
          styleClasses =
            "text-accent font-bold bg-accent/15 hover:bg-accent/25 active:bg-accent/40";
          break;
        case "loading":
          styleClasses = "font-bold bg-accent/20";
          break;
        case "disabled":
          styleClasses =
            "font-bold text-[#ffffff] dark:text-gray-400 bg-gray-200 dark:bg-gray-400/25";
          break;
      }
      spinnerClasses = "border-accent";
      break;
    case "transparent":
      switch (state) {
        case "rest":
          styleClasses =
            "text-accent font-bold hover:bg-accent/25 active:bg-accent/40";
          break;
        case "loading":
          styleClasses = "font-bold bg-accent/20";
          break;
        case "disabled":
          styleClasses = "font-bold text-gray-300 dark:text-gray-400";
          break;
      }
      spinnerClasses = "border-accent";
      break;
    case "danger":
      switch (state) {
        case "rest":
          styleClasses = cn(
            "bg-error text-white font-semibold",
            "active:bg-[color-mix(in_oklab,var(--color-error)_100%,black_10%)]",
            "hover:bg-[color-mix(in_oklab,var(--color-error)_100%,white_10%)]",
          );
          break;
        case "loading":
          styleClasses =
            "bg-[color-mix(in_oklab,var(--color-error)_100%,black_20%)]";
          break;
        case "disabled":
          styleClasses =
            "bg-gray-200 text-[#ffffff] dark:bg-gray-300/25 dark:text-gray-300";
          break;
      }
      break;
  }
  const paddingClasses = getPaddingClasses(
    hasIcon,
    hasLabel,
    shrinkOnMobile,
    paddingShrink,
  );
  return [cn(styleClasses, paddingClasses), spinnerClasses];
}

// I know this looks bad, but tailwind needs the full class names to be defined
function getPaddingClasses(
  hasIcon?: boolean,
  hasLabel?: boolean,
  shrinkOnMobile?: boolean,
  paddingShrink?: number,
) {
  let paddingClasses = "";
  switch (paddingShrink) {
    case 0.5:
      paddingClasses = "p-1.5 ";
      break;
    case 0.25:
      paddingClasses = "p-1.75 ";
      break;
    default:
      paddingClasses = "p-2 ";
      break;
  }
  if (hasIcon) {
    if (hasLabel) {
      switch (paddingShrink) {
        case 0.5:
          paddingClasses += shrinkOnMobile
            ? "md:pr-3.5 md:pl-2"
            : "pr-3.5 pl-2";
          break;
        case 0.25:
          paddingClasses += shrinkOnMobile
            ? "md:pr-3.75 md:pl-2.25"
            : "pr-3.75 pl-2.25";
          break;
        default:
          paddingClasses += shrinkOnMobile
            ? "md:pr-4 md:pl-2.5"
            : "pr-4 pl-2.5";
          break;
      }
    }
  } else {
    switch (paddingShrink) {
      case 0.5:
        paddingClasses += "px-3.5";
        break;
      case 0.25:
        paddingClasses += "px-3.75";
        break;
      default:
        paddingClasses += "px-4";
        break;
    }
  }
  return paddingClasses;
}
