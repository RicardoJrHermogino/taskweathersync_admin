export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    // Add routes that need protection
    "/admin/:path*",
    "/dashboard/:path*",
    "/inside_pages/:path*",
    // Add other protected routes here
  ]
}