import { NextResponse } from 'next/server'
import { createMiddlewareSupabaseClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareSupabaseClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith('/dashboard/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/dashboard/admin/:path*']
}
