import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    try {
      await supabase.auth.signOut({ scope: "global" });
    } catch {
      // Continue even if session is already invalid
    }

    const response = NextResponse.json({
      success: true,
      message: "Signed out successfully",
    });

    // 1. Clear all cookies currently present on request that relate to Supabase / Auth
    const allCookies = request.cookies.getAll();
    allCookies.forEach((cookie) => {
      const name = cookie.name.toLowerCase();
      if (
        name.startsWith("sb-") ||
        name.includes("auth") ||
        name.includes("supabase") ||
        name.includes("token")
      ) {
        response.cookies.set(cookie.name, "", {
          maxAge: 0,
          path: "/",
          expires: new Date(0),
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });
        response.cookies.delete(cookie.name);
      }
    });

    // 2. Also proactively expire common token names
    const explicitCookieNames = [
      "sb-access-token",
      "sb-refresh-token",
      "supabase-auth-token",
      "sb-auth-token",
      "sb-provider-token",
    ];

    explicitCookieNames.forEach((cookieName) => {
      response.cookies.set(cookieName, "", {
        maxAge: 0,
        path: "/",
        expires: new Date(0),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      response.cookies.delete(cookieName);
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
