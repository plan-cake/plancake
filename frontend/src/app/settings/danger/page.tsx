import DeleteAccountDialog from "@/features/account/settings/dialogs/delete-account";

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <div className="border-error/20 bg-error/10 flex flex-col gap-4 rounded-3xl border p-6 md:p-8">
        <div>
          <h2 className="text-error text-lg font-bold">Account Removal</h2>
          <p className="mt-1 text-sm opacity-80">
            Deleting your account{" "}
            <span className="font-bold underline">cannot</span> be undone.
          </p>
          <p className="mt-1 text-sm opacity-80">
            All your events and availabilities will be permanently deleted.
          </p>
        </div>

        <div className="mt-2">
          <DeleteAccountDialog />
        </div>
      </div>
    </div>
  );
}
