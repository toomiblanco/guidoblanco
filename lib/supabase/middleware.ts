import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getUser() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    console.log("🔒 Middleware: Protecting admin route:", request.nextUrl.pathname)
    
    if (!user) {
      console.log("❌ Middleware: No user found, redirecting to login")
      // No user, redirect to login page
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      const redirectResponse = NextResponse.redirect(url)
      // Copy cookies from supabaseResponse to maintain session state
      supabaseResponse.cookies.getAll().forEach(cookie => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
      })
      return redirectResponse
    }
    
    console.log("👤 Middleware: User found:", user.email, "ID:", user.id)
    
    // User exists, check if they're admin
    // We'll use a direct SQL query to avoid RLS recursion issues
    const { data: isAdmin, error: profileError } = await supabase
      .rpc('check_user_admin', { user_id: user.id })
    
    console.log("📋 Middleware: IsAdmin:", isAdmin, "Error:", profileError)
    
    if (!isAdmin) {
      console.log("❌ Middleware: User is not admin, redirecting to home")
      // User is not admin, redirect to home
      const url = request.nextUrl.clone()
      url.pathname = "/"
      const redirectResponse = NextResponse.redirect(url)
      // Copy cookies from supabaseResponse to maintain session state
      supabaseResponse.cookies.getAll().forEach(cookie => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
      })
      return redirectResponse
    }
    
    console.log("✅ Middleware: User is admin, allowing access")
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
