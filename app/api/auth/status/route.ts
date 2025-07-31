import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("gmail_access_token");
    const userEmail = cookieStore.get("user_email");

    return NextResponse.json({
      isAuthenticated: !!accessToken?.value,
      email: userEmail?.value || null,
    });
  } catch {
    return NextResponse.json({
      isAuthenticated: false,
      email: null,
    });
  }
}
