import AccountButton from "@/features/header/components/buttons/account";
import LoginButton from "@/features/header/components/buttons/login";
import ShrinkingHeader from "@/features/header/components/shrinking-header";
import { getSession } from "@/lib/utils/get-session";

export default async function Header() {
  const session = await getSession();

  return (
    <ShrinkingHeader>
      {session.isLoggedIn ? (
        <AccountButton accountDetails={session.user} />
      ) : (
        <LoginButton />
      )}
    </ShrinkingHeader>
  );
}
