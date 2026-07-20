import { Text } from "react-email";

import { EmailButton } from "@/features/email/components/button";
import CONTENT from "@/features/email/lib/content";
import renderEmail from "@/features/email/lib/render";
import { EmailContextError, EmailRenderResponse } from "@/features/email/type";

export async function passwordReset({
  token,
}: {
  token: string;
}): Promise<EmailRenderResponse> {
  if (!token) {
    throw new EmailContextError("Missing reset token.");
  }

  const RESET_URL = `${process.env.BASE_URL}/reset-password?token=${token}`;

  return {
    subject: "Plancake - Password Reset",
    html: await renderEmail({
      previewText:
        "Reset your Plancake account password with the link in this email.",
      title: "Password Reset",
      content: (
        <>
          <Text>Forgot your password? Click the button below to reset it.</Text>
          <EmailButton href={RESET_URL} label="Reset Password" />
        </>
      ),
      footerText: CONTENT.CAN_IGNORE,
    }),
    text:
      `Forgot your password? Reset it at this link: ${RESET_URL}` +
      "\n\n" +
      CONTENT.CAN_IGNORE,
  };
}
