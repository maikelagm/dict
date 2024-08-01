import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { drizzle as VercelDrizzle } from "drizzle-orm/vercel-postgres";
import postgres from "postgres";

import { env } from "../env";
import * as schema from "./schema";

/**
 * @maikelagm
 * El adaptador de vercel no admite la conexión directa a la base de datos,
 * necesita usar un agrupador de conexiones. Para el desarrollo local es
 * conveniente usar la conexión directa, la configuración del pooler es
 * aún tarea por hacer, no he logrado configurar supabavisor para este fin
 * usando supabase en desarrollo local.
 *
 * Nota: Usar una conexión directa afecta directamente al middleware de next que
 * solo funciona en tiempo de ejecución Edge
 *
 * Discusiones relacionadas:
 *  - https://github.com/supabase/cli/issues/2474#
 *  - https://github.com/vercel/storage/issues/123
 *  - https://www.reddit.com/r/nextjs/comments/19aw42g/supabase_or_vercel_postgres/
 *  - https://supabase.com/blog/supavisor-postgres-connection-pooler
 *  - https://www.nodejsauto.com/2024/07/ha-supabasetry-2-highly-available.html
 *  - https://supabase.com/docs/guides/database/connecting-to-postgres
 *
 */

const url = new URL(env.POSTGRES_URL);
const db =
  url.searchParams.get("workaround") === "supabase-pooler.vercel"
    ? VercelDrizzle(sql, { schema })
    : drizzle(postgres(env.POSTGRES_URL), { schema });

export { db };
