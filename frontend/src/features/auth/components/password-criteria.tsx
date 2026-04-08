import { CheckIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils/classname";

type PasswordCriteriaProps = {
  criteria: { [key: string]: boolean };
};

export default function PasswordCriteria(props: PasswordCriteriaProps) {
  const allCriteriaMet = Object.values(props.criteria).every((value) => value);

  const iconClass = "w-4 h-4";

  return (
    <div className="w-full text-sm">
      {allCriteriaMet ? (
        <div className="flex items-center gap-1">
          <CheckIcon className={iconClass} />
          <b>Password is strong!</b>
        </div>
      ) : (
        <>
          <b>Your password must:</b>
          {Object.entries(props.criteria).map(([key, value], index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-1",
                value ? "line-through opacity-50" : "",
              )}
            >
              {value ? (
                <CheckIcon className={iconClass} />
              ) : (
                <XIcon className={iconClass} />
              )}
              {key}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
