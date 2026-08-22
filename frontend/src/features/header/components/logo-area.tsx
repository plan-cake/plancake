import { motion, useTransform } from "framer-motion";
import Link from "next/link";

import LinkText from "@/components/link-text";
import Logo from "@/components/logo";
import { useHeaderSize } from "@/features/header/context";
import { getCurrentVersion } from "@/features/version-history/data";

export default function LogoArea() {
  const { shrinkAmount } = useHeaderSize();

  const versionStyle = useTransform(shrinkAmount, [0, 1], {
    opacity: [1, 0],
  });

  return (
    <div>
      <Link href="/">
        <Logo shrinkOnScroll />
      </Link>
      <motion.div style={versionStyle}>
        <Link href="/version-history" className="text-xs">
          <LinkText unbolded>{getCurrentVersion()}</LinkText>
        </Link>
      </motion.div>
    </div>
  );
}
