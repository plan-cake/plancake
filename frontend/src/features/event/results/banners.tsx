import { AnimatePresence, motion, Variants } from "framer-motion";

import { ResultsAvailabilityMap } from "@/core/availability/types";
import {
  getHighestMatchCount,
  hasMutualAvailability,
} from "@/features/event/results/lib/utils";
import { Banner } from "@/features/system-feedback/banner/base";
import { MESSAGES } from "@/lib/messages";
import { AllAvailability } from "@/lib/utils/api/types";

export function getResultBanner(
  availabilities: ResultsAvailabilityMap,
  participants: AllAvailability["participants"],
  timeslots: Date[],
  isWeekEvent: boolean,
  participated: boolean,
): React.ReactNode {
  const bannerData = () => {
    if (
      !isWeekEvent &&
      timeslots.length > 0 &&
      timeslots[timeslots.length - 1] < new Date()
    ) {
      return {
        element: (
          <Banner type="info" subtitle={MESSAGES.INFO_EVENT_PASSED} showPing />
        ),
        id: "event-passed",
      };
    } else if (participants.length === 0) {
      return {
        element: (
          <Banner
            type="info"
            subtitle="No one has submitted availability!"
            showPing
          >
            <p className="md:hidden">{MESSAGES.INFO_ADD_AVAILABILITY_MOBILE}</p>
            <p className="hidden md:block">{MESSAGES.INFO_ADD_AVAILABILITY}</p>
          </Banner>
        ),
        id: "no-participants",
      };
    } else if (!hasMutualAvailability(availabilities, participants)) {
      if (getHighestMatchCount(availabilities) <= 1) {
        return {
          element: (
            <Banner type="info" subtitle="Yikes..." showPing>
              <p>{MESSAGES.INFO_NO_MUTUAL_AVAILABILITY}</p>
            </Banner>
          ),
          id: "no-mutual-availability",
        };
      }
      return {
        element: (
          <Banner type="info" subtitle="Oh dear :(" showPing>
            <p>{MESSAGES.INFO_NO_IDEAL_TIMES_BANNER}</p>
          </Banner>
        ),
        id: "no-ideal-times",
      };
    } else if (participated && participants.length === 1) {
      return {
        element: (
          <Banner type="info" subtitle="Waiting for others..." showPing>
            <p>{MESSAGES.INFO_COPY_SHARE_LINK}</p>
          </Banner>
        ),
        id: "share-link",
      };
    } else if (!participated) {
      return {
        element: (
          <Banner type="info" subtitle="Don't be a stranger!" showPing>
            <p className="md:hidden">{MESSAGES.INFO_ADD_AVAILABILITY_MOBILE}</p>
            <p className="hidden md:block">{MESSAGES.INFO_ADD_AVAILABILITY}</p>
          </Banner>
        ),
        id: "add-availability",
      };
    }

    return { element: null, id: null };
  };

  const variants: Variants = {
    enter: {
      height: "auto",
      marginBottom: "1rem",
      opacity: 1,
      x: "0%",
      transition: {
        // Delayed extra to match with the exit animation of the banner
        height: { duration: 0.3, delay: 0.4, ease: "easeOut" },
        marginBottom: { duration: 0.3, delay: 0.4, ease: "easeOut" },
        opacity: { duration: 0.4, delay: 0.7, ease: "backOut" },
        x: { duration: 0.4, delay: 0.7, ease: "backOut" },
      },
    },
    exit: {
      height: 0,
      marginBottom: 0,
      opacity: 0,
      x: "-2rem",
      transition: {
        opacity: { duration: 0.4, ease: "backIn" },
        x: { duration: 0.4, ease: "backIn" },
        height: { duration: 0.3, delay: 0.4, ease: "easeOut" },
        marginBottom: { duration: 0.3, delay: 0.4, ease: "easeOut" },
      },
    },
  };

  const { element, id } = bannerData();

  return (
    <AnimatePresence initial={false} mode="sync">
      {element && (
        <motion.div
          key={id}
          initial={{
            height: 0,
            opacity: 0,
            x: "5%",
            marginBottom: 0,
          }}
          animate="enter"
          exit="exit"
          variants={variants}
        >
          {element}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
