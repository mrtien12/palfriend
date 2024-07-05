import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    '/',
    '/accounts/:path*',
    '/budgets',
    '/dashboard',
    '/insights',
    '/insights-time',
    '/scheduled',
  ],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  if (req.nextUrl.pathname === '/') {
    return NextResponse.redirect(`${url.origin}/dashboard`);
  }
  return NextResponse.rewrite(req.nextUrl);
}
