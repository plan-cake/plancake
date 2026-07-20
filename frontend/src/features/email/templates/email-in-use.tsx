import { Link, Text } from "react-email";

import CONTENT from "@/features/email/lib/content";
import renderEmail from "@/features/email/lib/render";
import { EmailRenderResponse } from "@/features/email/type";

const CONTENT_TEXT =
  "You just tried to register a Plancake account using this email, but it looks like it was already used for one.";
const LOGIN_URL = `${process.env.BASE_URL}/login`;

export async function emailInUse(): Promise<EmailRenderResponse> {
  return {
    subject: "Plancake - Email in Use",
    html: await renderEmail({
      previewText: "Your email is already associated with an account.",
      title: "Email in Use",
      content: (
        <>
          <Text>
            {CONTENT_TEXT} Log in{" "}
            <Link href={LOGIN_URL} className="text-accent underline">
              here
            </Link>{" "}
            instead.
          </Text>
        </>
      ),
      footerText: CONTENT.CAN_IGNORE,
    }),
    text: `${CONTENT_TEXT} Log in at ${LOGIN_URL} instead.\n\n${CONTENT.CAN_IGNORE}`,
  };
}
