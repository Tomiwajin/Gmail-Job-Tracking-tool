import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: settings, error } = await supabase
      .from("user_settings")
      .select("excluded_emails")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Settings fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch settings", details: error.message },
        { status: 500 }
      );
    }

    const result = {
      excluded_emails: settings?.excluded_emails || [],
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json(
      {
        error: "Server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { excluded_emails } = body;

    const { error } = await supabase.from("user_settings").upsert(
      {
        user_id: userId,
        excluded_emails: excluded_emails || [],
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    );

    if (error) {
      console.error("Settings update error:", error);
      return NextResponse.json(
        { error: "Failed to update settings", details: error.message },
        { status: 500 }
      );
    }

    const result = {
      success: true,
      excluded_emails: excluded_emails || [],
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Settings PUT error:", error);
    return NextResponse.json(
      {
        error: "Server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
