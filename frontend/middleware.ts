import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'shree_saree_secret_key'
);

const PROTECTED_ROUTES = ['/dashboard'];
const PUBLIC_ROUTES = ['/login'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  // Get token from cookie (set after login)
  const token = req.cookies.get('ss_admin_token')?.value;

  if (isProtected) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
      // Token invalid or expired
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // If already logged in, redirect /login → /dashboard
  if (isPublic && token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.redirect(new URL('/dashboard', req.url));
    } catch {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
