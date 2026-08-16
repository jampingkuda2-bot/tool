import { cookies } from "next/headers";
import { getExpectedToken } from "@/lib/auth";

export async function GET() {
  const session = cookies().get("admin_session");
  const authed = session?.value === getExpectedToken();
  return Response.json({ authed });
}
