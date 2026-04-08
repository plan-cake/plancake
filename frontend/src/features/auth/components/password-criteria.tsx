import { CheckIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils/classname";

type PasswordCriteriaProps = {
  criteria: { [key: string]: boolean };
};

export default function PasswordCriteria(props: PasswordCriteriaProps) {
  const allCriteriaMet = Object.values(props.criteria).every((value) => value);

  return (
    <div className="w-full text-sm">
      {allCriteriaMet ? (
        <div className="flex items-center gap-1">
          <CheckIcon />
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
              {value ? <CheckIcon /> : <XIcon />}
              {key}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
