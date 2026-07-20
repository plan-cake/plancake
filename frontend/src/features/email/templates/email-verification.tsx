import { Text } from "react-email";

import { EmailButton } from "@/features/email/components/button";
import NOTES from "@/features/email/lib/notes";
import renderEmail from "@/features/email/lib/render";
import { EmailContextError, EmailRenderResponse } from "@/features/email/type";

const CONTENT_TEXT =
  "Welcome to Plancake! Verify your email address to get started.";

export async function emailVerification({
  code,
}: {
  code: string;
}): Promise<EmailRenderResponse> {
  if (!code) {
    throw new EmailContextError("Missing verification code.");
  }

  const VERIFY_URL = `${process.env.BASE_URL}/verify-email?code=${code}`;

  return {
    subject: "Plancake - Email Verification",
    html: await renderEmail({
      previewText: CONTENT_TEXT,
      title: "Email Verification",
      content: (
        <>
          <Text>{CONTENT_TEXT}</Text>
          <EmailButton href={VERIFY_URL} label="Verify Email Address" />
        </>
      ),
      footerText: NOTES.IGNORE_EMAIL,
    }),
    text: `${CONTENT_TEXT} Click this link to verify your email: ${VERIFY_URL}\n\n${NOTES.IGNORE_EMAIL}`,
  };
}
