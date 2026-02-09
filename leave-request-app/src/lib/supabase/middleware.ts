import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

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
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Define public routes that don't require authentication
    const publicRoutes = ['/login', '/register', '/verify-otp', '/forgot-password', '/reset-password']
    const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))

    // Handle authentication and verification
    if (user) {
        // Fetch profile to check verification status
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_verified')
            .eq('id', user.id)
            .single()

        const isVerified = profile?.is_verified ?? false

        if (!isVerified) {
            // User is logged in but not verified - MUST go to verify-otp
            // EXCEPT if they are trying to go to a public route, API route, or verify-otp itself
            if (!isPublicRoute && request.nextUrl.pathname !== '/verify-otp' && !request.nextUrl.pathname.startsWith('/api/')) {
                const url = request.nextUrl.clone()
                url.pathname = '/verify-otp'
                return NextResponse.redirect(url)
            }
        } else {
            // User is logged in and verified
            if (isPublicRoute) {
                // Verified users shouldn't see login/register/verify-otp
                const url = request.nextUrl.clone()
                url.pathname = '/dashboard'
                return NextResponse.redirect(url)
            }
        }
    } else {
        // No user logged in
        if (
            !isPublicRoute &&
            !request.nextUrl.pathname.startsWith('/api/')
        ) {
            // Not a public route, redirect to login
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }
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
