import { Section, Text } from "react-email";

import CONTENT from "@/features/email/lib/content";
import renderEmail from "@/features/email/lib/render";
import { EmailContextError, EmailRenderResponse } from "@/features/email/type";

const WELCOME_TEXT = "Welcome to Plancake!";
const CONTENT_TEXT =
  "Enter the following code to verify your email address and get started:";

export async function emailVerificationCode({
  code,
}: {
  code: string;
}): Promise<EmailRenderResponse> {
  if (!code) {
    throw new EmailContextError("Missing verification code.");
  }

  return {
    subject: "Plancake - Email Verification Code",
    html: await renderEmail({
      previewText:
        "Verify your email for Plancake with the code in this email.",
      title: "Email Verification Code",
      content: (
        <>
          <Text>{WELCOME_TEXT}</Text>
          <Text>{CONTENT_TEXT}</Text>
          <Section className="bg-background rounded-2xl p-2">
            <Text className="text-accent text-2xl font-bold">{code}</Text>
          </Section>
          <Text className="opacity-75">{CONTENT.CODE_EXPIRE}</Text>
        </>
      ),
      footerText: CONTENT.CAN_IGNORE,
    }),
    text:
      WELCOME_TEXT +
      "\n\n" +
      CONTENT_TEXT +
      "\n\n" +
      code +
      "\n\n" +
      CONTENT.CAN_IGNORE,
  };
}
