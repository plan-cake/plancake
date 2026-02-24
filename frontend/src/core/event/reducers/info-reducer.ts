import { DEFAULT_RANGE_SPECIFIC } from "@/core/event/lib/default-range";
import { expandEventRange } from "@/core/event/lib/expand-event-range";
import {
  EventRangeReducer,
  EventRangeAction,
} from "@/core/event/reducers/range-reducer";
import { EventInformation } from "@/core/event/types";

export type EventInfoAction =
  | { type: "SET_TITLE"; payload: string }
  | { type: "SET_CUSTOM_CODE"; payload: string }
  | EventRangeAction
  | { type: "RESET" };

export function EventInfoReducer(
  state: EventInformation,
  action: EventInfoAction,
): EventInformation {
  switch (action.type) {
    case "SET_TITLE":
      return {
        ...state,
        title: action.payload,
      };
    case "SET_CUSTOM_CODE":
      return {
        ...state,
        customCode: action.payload,
      };
    case "RESET":
      return {
        title: "",
        customCode: "",
        eventRange: DEFAULT_RANGE_SPECIFIC,
        timeslots: expandEventRange(DEFAULT_RANGE_SPECIFIC),
        originalEventRange: state.originalEventRange,
      };
    default:
      const newEventRange = EventRangeReducer(
        state.eventRange,
        action as EventRangeAction,
      );

      if (newEventRange === state.eventRange) {
        return state;
      }

      return {
        ...state,
        eventRange: newEventRange,
        timeslots: expandEventRange(newEventRange),
      };
  }
}
