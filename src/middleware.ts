import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, host } = request.nextUrl;
  const hostname = request.headers.get("host") ?? host;

  // Si el acceso es desde admin.diamylasercut.com.mx,
  // redirigir automáticamente a /admin
  if (hostname.startsWith("admin.") && !pathname.startsWith("/admin") && !pathname.startsWith("/api")) {
    return NextResponse.redirect(new URL("/admin" + pathname, request.url));
  }

  // Proteger rutas /admin (excepto /admin/login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get("admin_session")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads).*)"],
};
