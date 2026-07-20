import { Section, Text } from "react-email";

import CONTENT from "@/features/email/lib/content";
import renderEmail from "@/features/email/lib/render";
import { EmailContextError, EmailRenderResponse } from "@/features/email/type";

const CONTENT_TEXT =
  "Enter the following code to reset your Plancake account password:";

export async function passwordResetCode({
  code,
}: {
  code: string;
}): Promise<EmailRenderResponse> {
  if (!code) {
    throw new EmailContextError("Missing reset code.");
  }

  return {
    subject: "Plancake - Password Reset Code",
    html: await renderEmail({
      previewText:
        "Reset your Plancake account password with the code in this email.",
      title: "Password Reset Code",
      content: (
        <>
          <Text>{CONTENT_TEXT}</Text>
          <Section className="bg-background rounded-2xl p-2">
            <Text className="text-accent text-2xl font-bold">{code}</Text>
          </Section>
          <Text className="mb-0">{CONTENT.CHANGE_PASSWORD}</Text>
        </>
      ),
    }),
    text: CONTENT_TEXT + "\n\n" + code + "\n\n" + CONTENT.CHANGE_PASSWORD,
  };
}
