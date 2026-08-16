import { cookies } from "next/headers";
import { checkPassword, getExpectedToken } from "@/lib/auth";

export async function POST(request) {
  const { password } = await request.json();

  if (!password || !checkPassword(password)) {
    return Response.json({ error: "Password salah" }, { status: 401 });
  }

  const token = getExpectedToken();
  cookies().set("admin_session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  });

  return Response.json({ success: true });
}
