import Checkbox from "@/components/checkbox";
import LinkText from "@/components/link-text";
import TextInputField from "@/components/text-input-field";
import { ChangePasswordStepProps } from "@/features/account/setting-dialogs/change-password/use-change-password";

export default function ChangeStep({ flow }: ChangePasswordStepProps) {
  return (
    <div>
      <p>
        Enter your current password and the new one you would like to replace it
        with.
      </p>
      <div className="mt-[25px] flex flex-col justify-center gap-4">
        <TextInputField
          key="password"
          id="password"
          type="password"
          label="Current Password*"
          value={flow.form.currentPassword}
          onChange={(value) => {
            flow.updateForm("currentPassword", value);
          }}
          outlined
          error={flow.errors.currentPassword || flow.errors.api}
        />

        <TextInputField
          key="newPassword"
          id="newPassword"
          type="password"
          label="New Password*"
          value={flow.form.newPassword}
          onChange={(value) => {
            flow.updateForm("newPassword", value);
          }}
          onFocus={() => flow.setShowCriteria(true)}
          onBlur={() => {
            setTimeout(() => {
              if (!flow.form.newPassword || flow.passwordIsStrong) {
                flow.setShowCriteria(false);
              }
            }, 0);
          }}
          outlined
          error={flow.errors.newPassword || flow.errors.api}
          showPasswordCriteria={flow.showCriteria}
          passwordCriteria={flow.criteria}
        />

        <TextInputField
          key="confirmPassword"
          id="confirmPassword"
          type="password"
          label="Retype Password*"
          value={flow.form.confirmPassword}
          onChange={(value) => flow.updateForm("confirmPassword", value)}
          outlined
          error={flow.errors.confirmPassword || flow.errors.api}
        />
      </div>
      <div className="mt-4 flex flex-wrap justify-between gap-2 text-sm">
        <Checkbox
          label="Logout of all other devices"
          checked={flow.form.pruneSessions}
          onChange={() =>
            flow.updateForm("pruneSessions", !flow.form.pruneSessions)
          }
        />
        <button
          type="button"
          onClick={flow.handleForgotPassword}
          className="cursor-pointer border-none bg-transparent p-0"
        >
          <LinkText>Forgot password?</LinkText>
        </button>
      </div>
    </div>
  );
}
