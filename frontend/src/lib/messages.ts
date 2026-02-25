import { MAX_DEFAULT_NAME_LENGTH } from "@/features/account/settings/lib/constants";
import {
  MAX_DURATION,
  MAX_TITLE_LENGTH,
} from "@/features/event/editor/validate-data";

export const MESSAGES = {
  // generic errors
  ERROR_GENERIC: "An error occurred. Please try again.",
  ERROR_RATE_LIMIT: "Too many requests. Please try again later.",

  // auth errors
  ERROR_EMAIL_MISSING: "Missing email.",
  ERROR_PASSWORD_MISSING: "Missing password.",
  ERROR_PASSWORD_REUSE: "Cannot reuse old password.",
  ERROR_PASSWORD_WEAK: "Password is not strong enough.",
  ERROR_PASSWORD_MISMATCH: "Passwords do not match.",
  ERROR_RESET_TOKEN_INVALID: "Invalid or expired reset token.",

  // availability errors
  ERROR_NAME_MISSING: "Missing name.",
  ERROR_NAME_TAKEN: "This name is unavailable. Please choose another.",
  ERROR_AVAILABILITY_MISSING: "Please select your availability on the grid.",

  // event errors
  ERROR_EVENT_NAME_MISSING: "Missing event name.",
  ERROR_EVENT_NAME_LENGTH: `Event name must be under ${MAX_TITLE_LENGTH} characters.`,
  ERROR_EVENT_CODE_TAKEN: "This code is unavailable. Please choose another.",
  ERROR_EVENT_RANGE_INVALID: "Please select a valid date/time range.",
  ERROR_EVENT_RANGE_TOO_LONG: `Too many days selected. Max is ${MAX_DURATION}.`,

  // default name errors
  ERROR_DEFAULT_NAME_LENGTH: `Max ${MAX_DEFAULT_NAME_LENGTH} characters.`,

  // success messages
  SUCCESS_EMAIL_SENT: "Email resent. Please check your inbox.",
  SUCCESS_PASSWORD_RESET: "Password has been reset successfully.",
  SUCCESS_LOGOUT: "You have been logged out.",
  SUCCESS_DEFAULT_NAME_SAVED: "Nickname saved successfully.",
  SUCCESS_DEFAULT_NAME_REMOVED: "Nickname removed successfully.",
  SUCCESS_EVENT_DELETE: "Event deleted successfully.",

  // copy link messages
  COPY_LINK_SUCCESS: "Link copied to clipboard!",
  COPY_LINK_FAILURE: "Failed to copy link. Please try again.",

  // info messages
  INFO_NAME_AUTOFILLED: "You can change this behavior anytime in account settings.",
  INFO_ALREADY_LOGGED_IN: "You are already logged in.",
};
