import { forwardRef } from "react";

import BaseButton from "@/features/button/components/base";
import { ActionButtonProps } from "@/features/button/props";

type Ref = HTMLButtonElement;

const ActionButton = forwardRef<Ref, ActionButtonProps>(
  (
    {
      buttonStyle,
      icon,
      label,
      shrinkOnMobile = false,
      tooltip,
      loading = false,
      disabled = false,
      onClick,
      loadOnSuccess = false,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <BaseButton
        _buttontype="action"
        buttonStyle={buttonStyle}
        icon={icon}
        label={label}
        shrinkOnMobile={shrinkOnMobile}
        tooltip={tooltip}
        loading={loading}
        disabled={disabled}
        onClick={onClick}
        loadOnSuccess={loadOnSuccess}
        className={className}
        ref={ref}
        {...props}
      />
    );
  },
);

ActionButton.displayName = "ActionButton";
export default ActionButton;
