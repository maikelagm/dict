import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  console.log(request.url);
}

/**
 * @maikelagm
 * Usar una conexión directa a la base de datos postgres dentro del middleware
 * no es posible hasta el momento, el tiempo de ejecución Edge no admite
 * conexiones directas a postgres. Por lo que usar NextAuth middleware con la
 * strategia de sessión de base de datos falla.
 */

// Clerk config
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
