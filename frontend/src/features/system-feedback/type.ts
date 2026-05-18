/**
 * Base Feedback Types
 * These are the core types used across different feedback components:
 * - "success": Indicates a successful operation.
 * - "error": Indicates an error has occurred.
 * - "info": Provides informational messages.
 */
export type BaseFeedbackType = "success" | "error" | "info";

/* EXTENDED FEEDBACK TYPES */
export type BannerType = BaseFeedbackType;
export type ToastType = BaseFeedbackType | "copy";
export type DialogType = BaseFeedbackType | "warning" | "delete";
