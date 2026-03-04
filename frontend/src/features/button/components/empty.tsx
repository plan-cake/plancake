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
        buttonStyle={buttonStyle}
        icon={icon}
        label={label}
        shrinkOnMobile={shrinkOnMobile}
        loading={loading}
        disabled={disabled}
        isLink={false}
        className={className}
        ref={ref}
        {...props}
      />
    );
  },
);

EmptyButton.displayName = "EmptyButton";
export default EmptyButton;
