import Link from "next/link";

import LinkText from "@/components/link-text";
import Logo from "@/components/logo";
import { getCurrentVersion } from "@/features/version-history/data";

export default function LogoArea() {
  return (
    <div>
      {/* Text Container */}
      <Link href="/">
        <Logo />
      </Link>
      <Link href="/version-history" className="text-xs">
        <LinkText unbolded>{getCurrentVersion()}</LinkText>
      </Link>
    </div>
  );
}
