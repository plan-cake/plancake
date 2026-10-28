import { Metadata } from "next";

import LegalDocument from "@/features/legal/components/legal-document";
import { constructMetadata } from "@/lib/utils/construct-metadata";

const TITLE = "Privacy Policy";

export function generateMetadata(): Metadata {
  return constructMetadata(TITLE, "Read Plancake's Privacy Policy.");
}

export default function Page() {
  return <LegalDocument title={TITLE} file="privacy.md" />;
}
