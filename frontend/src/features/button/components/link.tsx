import { forwardRef } from "react";

import BaseButton from "@/features/button/components/base";
import { LinkButtonProps } from "@/features/button/props";

type Ref = HTMLAnchorElement;

const LinkButton = forwardRef<Ref, LinkButtonProps>(
  (
    {
      buttonStyle,
      icon,
      label,
      shrinkOnMobile = false,
      tooltip,
      loading = false,
      disabled = false,
      href,
      target,
      fullWidth = false,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <BaseButton
        _buttontype="link"
        buttonStyle={buttonStyle}
        icon={icon}
        label={label}
        shrinkOnMobile={shrinkOnMobile}
        tooltip={tooltip}
        loading={loading}
        disabled={disabled}
        href={href}
        target={target}
        fullWidth={fullWidth}
        className={className}
        ref={ref}
        {...props}
      />
    );
  },
);

LinkButton.displayName = "LinkButton";
export default LinkButton;
