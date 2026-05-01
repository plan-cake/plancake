import { DialogType } from "@/features/system-feedback";

type CommonDialogProps = {
  /**
   * Title of the dialog
   * Required for accessibility (used in Title components and aria attributes)
   *
   * @type {string}
   */
  title: string;
  /**
   * Description of the dialog
   * Required for accessibility (used in Description components and aria attributes)
   *
   * @type {string}
   */
  description: string;
  /**
   * Dialog open state (for controlled dialogs)
   * If not provided, the dialog will manage its own open state internally.
   *
   * @type {boolean}
   * @default undefined
   */
  open?: boolean;
  /**
   * Callback when the open state changes (for controlled dialogs)
   * If not provided, the dialog will manage its own open state internally.
   *
   * @type {(open: boolean) => void}
   * @default undefined
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * The content of the dialog, which can be any valid React node.
   *
   * @type {React.ReactNode}
   * @default undefined
   */
  children?: React.ReactNode;
  /**
   * Trigger element to open the dialog. If not provided, the dialog can only be opened
   * programmatically via the `open` prop.
   *
   * @type {React.ReactNode}
   * @default undefined
   */
  trigger?: React.ReactNode;
  /**
   * Whether to disable the trigger element (if provided).
   *
   * @type {boolean}
   * @default false
   */
  triggerDisabled?: boolean;
  /**
   * Indicates whether or not the drawer version of the dialog should be displayed
   * as a nested drawer or not. This is to ensure the correct styling and behavior
   * when the dialog is used inside another drawer.
   *
   * @type {boolean}
   * @default false
   */
  asNestedDrawer?: boolean;
  /**
   * Additional className to apply to the dialog overlay, for further customization.
   *
   * @type {string}
   * @default undefined
   */
  overlayClassName?: string;
};

export type BaseDialogProps = CommonDialogProps;

export type ConfirmationDialogProps = CommonDialogProps & {
  type: DialogType;
  /**
   * Enforced strictly as a string for semantic standard confirmations.
   */
  description: string;

  /** Callback function that is called when the user confirms the action */
  onConfirm: () => boolean | Promise<boolean>;

  /** Whether to automatically close the dialog after confirming */
  autoClose?: boolean;
};

export type FormDialogProps = CommonDialogProps & {
  type: DialogType;
  /** * Callback function called when the native <form> is submitted.
   * Returning true (or a Promise resolving to true) typically closes the modal.
   */
  onSubmit: () => boolean | Promise<boolean>;

  /** Text for the submit button (Defaults to "Save" or "Submit") */
  submitLabel?: string;

  /** Text for the cancel button (Defaults to "Cancel") */
  cancelLabel?: string;
};
