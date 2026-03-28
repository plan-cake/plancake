import AccountButton from "@/components/header/account-button";
import DashboardButton from "@/components/header/dashboard-button";
import LogoArea from "@/components/header/logo-area";
import NewEventButton from "@/components/header/new-event-button";
import ThemeToggle from "@/components/header/theme-toggle";
import { getSession } from "@/features/account/get-session";

export default async function Header() {
  const accountDetails = await getSession();
  console.log("Header account details:", accountDetails); // Debug log to check account details

  return (
    <header className="h-25 fixed top-0 z-40 w-full pt-4">
      <nav className="flex w-full max-w-[1440px] justify-between px-4">
        <LogoArea />

        <div className="frosted-glass flex h-fit items-center gap-2 rounded-full p-2">
          <NewEventButton />
          <ThemeToggle />
          <DashboardButton />
          <AccountButton accountDetails={accountDetails} />
        </div>
      </nav>
    </header>
  );
}
