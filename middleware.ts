import { updateSession } from "@/lib/supabase/middleware"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Only match admin routes and auth routes to protect admin access
     * - /admin/* (all admin routes)
     * - /auth/* (authentication routes)
     */
    "/admin/:path*",
    "/auth/:path*",
  ],
}
