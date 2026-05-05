import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(request) {
    const { pathname } = request.nextUrl;
    const token = request.nextauth.token;
    const username = token?.username;
    const tag = token?.tag;
    const isOnboarding = pathname.startsWith("/onboarding");

    if (token && (!username || !tag) && !isOnboarding) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => Boolean(token),
    },
    pages: {
      signIn: "/login",
    },
  },
);

export const config = {
  matcher: ["/dashboard/:path*", "/planner/:path*", "/habits/:path*", "/xp/:path*", "/settings/:path*", "/premium/:path*", "/social/:path*", "/onboarding/:path*"],
};
