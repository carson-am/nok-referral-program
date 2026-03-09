import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard/referral-history",
  "/dashboard/meeting-archive",
  "/dashboard/marketing-materials",
  "/dashboard/program-faq",
  "/dashboard/refer",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const path = req.nextUrl.pathname;

  if (isProtectedRoute(req) && !userId) {
    const signInUrl = new URL("/", req.url);
    return NextResponse.redirect(signInUrl);
  }
  if (userId && (path === "/" || path === "/sign-up")) {
    return NextResponse.redirect(new URL("/dashboard/referral-history", req.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
