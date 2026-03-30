import Checkbox from "@/components/checkbox";
import TextInputField from "@/components/text-input-field";
import { ChangePasswordStepProps } from "@/features/account/setting-dialogs/change-password/use-change-password";

export default function ResetStep({ flow }: ChangePasswordStepProps) {
  return (
    <div>
      <p>Enter your new password!</p>
      <div className="mt-[25px] flex flex-col justify-center gap-4">
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
            if (!flow.form.newPassword || flow.passwordIsStrong) {
              flow.setShowCriteria(false);
            }
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
      <div className="mt-4 flex justify-start text-sm">
        <div className="m-0 flex flex-col gap-2">
          <Checkbox
            label="Logout of all other devices"
            checked={flow.form.pruneSessions}
            onChange={() =>
              flow.updateForm("pruneSessions", !flow.form.pruneSessions)
            }
          />
        </div>
      </div>
    </div>
  );
}
