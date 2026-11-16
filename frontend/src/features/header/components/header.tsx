import LinkButton from "@/features/button/components/link";
import AccountButton from "@/features/header/components/buttons/account";
import ClientHeader from "@/features/header/components/header-client";
import { getSession } from "@/lib/utils/get-session";

export default async function Header() {
  const session = await getSession();

  return (
    <ClientHeader>
      {session.isLoggedIn ? (
        <AccountButton accountDetails={session.user} />
      ) : (
        <LinkButton
          className="relative z-10"
          buttonStyle="frosted glass inset"
          label="Log In"
          href="/login"
        />
      )}
    </ClientHeader>
  );
}
