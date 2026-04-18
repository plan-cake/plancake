import { getSession } from "@/features/account/get-session";
import AccountButton from "@/features/header/components/buttons/account";
import LoginButton from "@/features/header/components/buttons/login";
import ShrinkingHeader from "@/features/header/components/shrinking-header";

export default async function Header() {
  const session = await getSession();
  const isLoggedIn = session !== null;

  return (
    <ShrinkingHeader>
      {isLoggedIn ? (
        <AccountButton accountDetails={session} />
      ) : (
        <LoginButton />
      )}
    </ShrinkingHeader>
  );
}
