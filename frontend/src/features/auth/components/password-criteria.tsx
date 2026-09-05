import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils/classname";

type PasswordCriteriaProps = {
  open: boolean;
  criteria: { [key: string]: boolean };
};

export default function PasswordCriteria({
  open,
  criteria,
}: PasswordCriteriaProps) {
  const allCriteriaMet = Object.values(criteria).every((value) => value);

  const iconClass = "w-4 h-4";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="w-full overflow-hidden px-4 text-sm"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
        >
          <div className="pt-2 text-start">
            <AnimatePresence mode="sync">
              <motion.div
                key={allCriteriaMet ? "strong" : "criteria"}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                {allCriteriaMet ? (
                  <div className="flex items-center gap-1">
                    <CheckIcon className={iconClass} />
                    <b>Your password is strong!</b>
                  </div>
                ) : (
                  <>
                    <b>Your password must:</b>
                    {Object.entries(criteria).map(([key, value], index) => (
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
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
