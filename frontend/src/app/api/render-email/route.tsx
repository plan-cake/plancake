import { emailInUse } from "@/features/email/templates/email-in-use";
import { EmailRenderResponse } from "@/features/email/type";

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (
    !authHeader ||
    authHeader !== `Bearer ${process.env.EMAIL_BRIDGE_SECRET}`
  ) {
    return new Response("Forbidden", { status: 403 });
  }

  const { template_key: templateKey, context } = await req.json();

  let data: EmailRenderResponse;

  switch (templateKey) {
    case "email_in_use":
      data = await emailInUse();
      break;
    default:
      return new Response("Template not found", { status: 404 });
  }

  return Response.json(data);
}
