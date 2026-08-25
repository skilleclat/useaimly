import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();

    const response = NextResponse.json({ success: true, message: "Signed out successfully" });
    
    // Explicitly expire supabase auth cookies if any
    const cookiesToClear = [
      "sb-access-token",
      "sb-refresh-token",
      "supabase-auth-token",
    ];

    cookiesToClear.forEach((cookieName) => {
      response.cookies.set(cookieName, "", { maxAge: 0, path: "/" });
    });

    return response;
  } catch (error: any) {
    console.warn("Sign out server error:", error);
    return NextResponse.json({ success: true, warning: error?.message });
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
