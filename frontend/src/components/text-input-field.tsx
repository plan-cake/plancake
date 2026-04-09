import { useEffect, useRef, useState } from "react";

import * as Collapsible from "@radix-ui/react-collapsible";
import { EyeClosedIcon, EyeIcon, TriangleAlertIcon } from "lucide-react";

import PasswordCriteria from "@/features/auth/components/password-criteria";
import { cn } from "@/lib/utils/classname";

type FieldType = "text" | "email" | "password";

export type TextInputFieldProps = {
  id: string;
  type: FieldType;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  outlined?: boolean;
  error?: string;
  className?: string;
  showPasswordCriteria?: boolean;
  passwordCriteria?: { [key: string]: boolean };
};

export default function TextInputField(props: TextInputFieldProps) {
  const {
    id,
    type,
    label,
    value,
    onChange,
    onFocus,
    onBlur,
    error,
    outlined,
    className,
    showPasswordCriteria = false,
    passwordCriteria = {},
  } = props;
  const [showPassword, setShowPassword] = useState(false);

  // determine input type
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  // ref for placeholder size
  const labelRef = useRef<HTMLLabelElement>(null);
  const [labelWidth, setLabelWidth] = useState(0);
  useEffect(() => {
    const measureLabel = () => {
      if (labelRef.current) {
        // This accounts for the label being scaled down when floated
        setLabelWidth(labelRef.current.offsetWidth * 0.75);
      }
    };

    // Measure on mount and dependency changes
    measureLabel();

    // Also measure on window resize (mostly for zooming)
    window.addEventListener("resize", measureLabel);
    // Cleanup on unmount
    return () => {
      window.removeEventListener("resize", measureLabel);
    };
  }, [label, error]);
  const labelStartPos = "1rem"; // Equal to left-4

  // border element classes
  const borderClasses = cn(
    "pointer-events-none absolute inset-0 rounded-full",
    "border peer-focus:border-2",
    error ? "border-error" : "border-foreground",
  );

  return (
    <div className={`w-full ${className || ""}`}>
      <div className="relative w-full">
        {/* --- input field --- */}
        <input
          type={inputType}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder=" " // triggers placeholder-shown state for floating label
          className={cn(
            "peer w-full bg-transparent py-2",
            "focus:outline-none",
            outlined
              ? // Transparent border for proper spacing, actual border handled separately
                "rounded-full border border-transparent px-4"
              : "border-b-1 px-2",
            isPassword && "pr-10",
          )}
        />

        {/* --- border for outlined style --- */}
        {/**
         * There are two stacked borders, one with a cutout for the label (using a CSS
         * mask) and another that fills that gap with a full border. The second border
         * fades out when the label is floated.
         *
         * The size of the cutout is determined by the label width, measured with a ref.
         */}
        {outlined && (
          <>
            <div
              className={borderClasses}
              style={{
                maskImage: `linear-gradient(
                    to right,
                    black 0px,
                    black ${labelStartPos},
                    transparent ${labelStartPos},
                    transparent calc(${labelStartPos} + ${labelWidth}px),
                    black calc(${labelStartPos} + ${labelWidth}px)
                  ),
                  linear-gradient(black, black)
                `,
                maskSize: "100% 50%, 100% 50%",
                maskPosition: "top, bottom",
                maskRepeat: "no-repeat",
              }}
            />
            <div
              className={cn(
                borderClasses,
                "transition-opacity duration-200 ease-in-out",
                "peer-autofill:opacity-0 peer-focus:opacity-0 peer-[:not(:placeholder-shown)]:opacity-0",
              )}
            />
          </>
        )}

        {/* --- floating label --- */}
        <label
          htmlFor={id}
          ref={labelRef}
          className={cn(
            "pointer-events-none absolute origin-[0_0] cursor-text select-none px-1",
            "transition-[top,scale] duration-200 ease-in-out",
            outlined ? "left-4" : "left-1",
            className,

            // --- Floating Animation ---
            // State when placeholder is shown (input is empty)
            "peer-placeholder-shown:top-2.5 peer-placeholder-shown:scale-100",

            // State when floated (on focus or when value exists)
            "peer-focus:top-[-0.55rem] peer-focus:scale-75",
            "peer-autofill:top-[-0.55rem] peer-autofill:scale-75",
            "peer-[:not(:placeholder-shown)]:top-[-0.55rem] peer-[:not(:placeholder-shown)]:scale-75",
            outlined
              ? ""
              : "peer-autofill:top-[-1rem] peer-focus:top-[-1rem] peer-[:not(:placeholder-shown)]:top-[-1rem]",

            // colors
            error
              ? "text-error" // error
              : "text-foreground/50", // default
          )}
        >
          {error ? (
            <span className="flex items-center gap-1">
              <TriangleAlertIcon
                className={`${className}`}
                aria-hidden="true"
              />
              {error}
            </span>
          ) : (
            label
          )}
        </label>

        {/* --- trailing icon --- */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
          >
            {showPassword ? (
              <EyeIcon className="h-5 w-5" />
            ) : (
              <EyeClosedIcon className="h-5 w-5" />
            )}
          </button>
        )}
      </div>

      {/* Password Criteria */}
      <Collapsible.Root open={showPasswordCriteria}>
        <Collapsible.Content className="collapsible-content">
          <div className="px-4 pb-1 pt-2">
            <PasswordCriteria criteria={passwordCriteria} />
          </div>
        </Collapsible.Content>
      </Collapsible.Root>
    </div>
  );
}
