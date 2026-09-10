import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const localeMatch = pathname.match(/^\/(fr|en|ar)(?=\/|$)/);
  if (localeMatch) {
    const rewritten = request.nextUrl.clone();
    rewritten.pathname = pathname.slice(localeMatch[0].length) || "/";
    return NextResponse.rewrite(rewritten);
  }
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.rewrite(new URL("/admin-login", request.url));
  }
  if (!request.nextUrl.pathname.startsWith("/admin")) return NextResponse.next();

  const response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
      },
    },
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/admin/login", request.url));
  return response;
}

export const config = { matcher: ["/((?!_next|api|.*\\..*).*)", "/admin/:path*"] };