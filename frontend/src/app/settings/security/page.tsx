"use client";

import ChangePasswordDialog from "@/features/account/setting-dialogs/change-password/main-dialog";

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-panel flex flex-col gap-4 rounded-3xl border-none p-6 md:p-8">
        <div>
          <h2 className="text-lg font-bold">Password</h2>
          <p className="mt-1 text-sm leading-tight opacity-75">
            Update your password to keep your account secure.
          </p>
        </div>

        <div className="mt-2">
          <ChangePasswordDialog />
        </div>
      </div>
    </div>
  );
}
