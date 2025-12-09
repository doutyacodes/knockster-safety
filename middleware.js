// middleware.js
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export const config = {
  matcher: [
    '/super-admin/:path*',
    '/org-admin/:path*',
    '/moderator/:path*',
    '/users/:path*',     // Shared page
    '/home/:path*'
  ],
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // 🔹 Public routes (no auth required)
  const publicRoutes = ['/', '/auth/login', '/auth/signup', '/welcome'];

  if (
    publicRoutes.includes(pathname) ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/.well-known')
  ) {
    return NextResponse.next();
  }

  // 🔹 Read JWT cookie
  const token = request.cookies.get('user_token')?.value || request.cookies.get('user_token');

  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  try {
    // Verify JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const role = payload.role?.name; // super_admin / org_admin / moderator

    // ---------------------------------------------
    // 🟥 ROLE-BASED ACCESS CONTROL
    // ---------------------------------------------

    // 🔸 SUPER ADMIN — Only access super-admin/*
    if (pathname.startsWith('/super-admin')) {
      if (role !== 'super_admin')
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // 🔸 ORG ADMIN — Only access org-admin/*
    if (pathname.startsWith('/org-admin')) {
      if (role !== 'org_admin')
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // 🔸 MODERATOR — Only access moderator/*
    if (pathname.startsWith('/moderator')) {
      if (role !== 'moderator')
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // 🔸 SHARED ROUTE — /users → org_admin + moderator
    if (pathname.startsWith('/users')) {
      if (role !== 'org_admin' && role !== 'moderator')
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // All other valid paths continue
    return NextResponse.next();

  } catch (err) {
    console.log("❌ INVALID TOKEN:", err.message);

    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.cookies.delete('user_token');
    return response;
  }
}
