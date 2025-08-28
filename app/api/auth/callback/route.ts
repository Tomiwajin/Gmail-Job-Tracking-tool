import { type NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import { encrypt } from "@/lib/encryption";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Define a proper interface for the update data
interface UserUpdateData {
  updated_at: string;
  gmail_refresh_token?: string;
}

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

    if (!userInfo.email) {
      return NextResponse.redirect(new URL("/?error=no_email", request.url));
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", userInfo.email)
      .single();

    let userId: string;

    if (existingUser) {
      // Update existing user
      const updateData: UserUpdateData = {
        updated_at: new Date().toISOString(),
      };

      if (tokens.refresh_token) {
        updateData.gmail_refresh_token = encrypt(tokens.refresh_token);
      }

      await supabase
        .from("users")
        .update(updateData)
        .eq("email", userInfo.email);

      userId = existingUser.id;
    } else {
      // Create new user
      const { data: newUser, error } = await supabase
        .from("users")
        .insert({
          email: userInfo.email,
          gmail_refresh_token: tokens.refresh_token
            ? encrypt(tokens.refresh_token)
            : null,
        })
        .select("id")
        .single();

      if (error) {
        console.error("Database error:", error);
        return NextResponse.redirect(new URL("/?error=db_error", request.url));
      }

      userId = newUser.id;

      // Create default settings
      await supabase.from("user_settings").insert({
        user_id: userId,
        excluded_emails: [],
      });
    }

    // Set cookies
    const cookieStore = await cookies();
    cookieStore.set("gmail_access_token", tokens.access_token || "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600,
    });

    cookieStore.set("user_id", userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 3600,
    });

    cookieStore.set("user_email", userInfo.email, {
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
