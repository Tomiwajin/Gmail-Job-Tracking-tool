import { type NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { cookies } from "next/headers";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.redirect(new URL("/?error=no_code", request.url));
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    const cookieStore = await cookies();
    cookieStore.set("gmail_access_token", tokens.access_token || "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600,
    });

    if (tokens.refresh_token) {
      cookieStore.set("gmail_refresh_token", tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 3600,
      });
    }

    cookieStore.set("user_email", userInfo.email || "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 3600,
    });

    return NextResponse.redirect(new URL("/?connected=true", request.url));
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }
}
