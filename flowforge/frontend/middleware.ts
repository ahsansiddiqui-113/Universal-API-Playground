import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const PROTECTED_PREFIXES = ['/dashboard', '/workflows'];
const GUEST_ONLY_PATHS = new Set(['/login', '/signup']);

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession =
    Boolean(request.cookies.get('flowforge_access_token')?.value) ||
    Boolean(request.cookies.get('flowforge_refresh_token')?.value);

  if (PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix)) && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (GUEST_ONLY_PATHS.has(pathname) && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/workflows/:path*', '/login', '/signup'],
};
