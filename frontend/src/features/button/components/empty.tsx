import { forwardRef } from "react";

import BaseButton from "@/features/button/components/base";
import { EmptyButtonProps } from "@/features/button/props";

type Ref = HTMLButtonElement;

const EmptyButton = forwardRef<Ref, EmptyButtonProps>(
  (
    {
      buttonStyle,
      icon,
      label,
      shrinkOnMobile = false,
      loading = false,
      disabled = false,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <BaseButton
        _buttontype="empty"
        buttonStyle={buttonStyle}
        icon={icon}
        label={label}
        shrinkOnMobile={shrinkOnMobile}
        loading={loading}
        disabled={disabled}
        className={className}
        ref={ref}
        {...props}
      />
    );
  },
);

EmptyButton.displayName = "EmptyButton";
export default EmptyButton;
