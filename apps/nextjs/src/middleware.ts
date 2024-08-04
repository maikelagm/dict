import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  console.log(request.url);
}

// Clerk config
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};

// [ ] Configurar middleware de Authjs
/**
 * @maikelagm
 * Usar una conexión directa o mediante TCP a la base de datos postgres
 * dentro del middleware no es posible hasta el momento. Por lo que usar
 * Authjs middleware con la strategia de sessión de base de datos falla.
 *
 * Error
 *   cloudflare:sockets
 *   Module build failed: UnhandledSchemeError: Reading from "cloudflare:sockets" is not handled by plugins (Unhandled scheme).
 *   Webpack supports "data:" and "file:" URIs by default.
 *   You may need an additional plugin to handle "cloudflare:" URIs.
 *
 * Discusión relacionada:
 *  >> https://github.com/supabase/cli/issues/2474#issuecomment-2267649268
 */
