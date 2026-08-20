import { emailInUse } from "@/features/email/templates/email-in-use";
import { emailVerificationCode } from "@/features/email/templates/email-verification-code";
import { passwordResetCode } from "@/features/email/templates/password-reset-code";
import { EmailContextError, EmailRenderResponse } from "@/features/email/type";

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (
    !process.env.EMAIL_BRIDGE_SECRET ||
    !authHeader ||
    authHeader !== `Bearer ${process.env.EMAIL_BRIDGE_SECRET}`
  ) {
    return new Response("Forbidden", { status: 403 });
  }

  const { template_key: templateKey, context } = await req.json();

  let data: EmailRenderResponse;

  try {
    switch (templateKey) {
      case "email_in_use":
        data = await emailInUse();
        break;
      case "email_verification_code":
        data = await emailVerificationCode(context);
        break;
      case "password_reset_code":
        data = await passwordResetCode(context);
        break;
      default:
        return new Response("Template not found", { status: 404 });
    }
  } catch (e) {
    if (e instanceof EmailContextError) {
      return new Response(e.message, { status: 400 });
    } else {
      return new Response("Internal Server Error: " + (e as Error).message, {
        status: 500,
      });
    }
  }

  return Response.json(data);
}
