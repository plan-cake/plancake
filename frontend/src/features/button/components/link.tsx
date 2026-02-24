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
      loading = false,
      disabled = false,
      href,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <BaseButton
        buttonStyle={buttonStyle}
        icon={icon}
        label={label}
        shrinkOnMobile={shrinkOnMobile}
        loading={loading}
        disabled={disabled}
        isLink={true}
        href={href}
        className={className}
        ref={ref}
        {...props}
      />
    );
  },
);

LinkButton.displayName = "LinkButton";
export default LinkButton;
