import AccountButton from "@/features/header/components/buttons/account";
import LoginButton from "@/features/header/components/buttons/login";
import ClientHeader from "@/features/header/components/header-client";
import { getSession } from "@/lib/utils/get-session";

export default async function Header() {
  const session = await getSession();

  return (
    <ClientHeader>
      {session.isLoggedIn ? (
        <AccountButton accountDetails={session.user} />
      ) : (
        <LoginButton />
      )}
    </ClientHeader>
  );
}
