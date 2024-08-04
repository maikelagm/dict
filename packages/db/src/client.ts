import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "../env";
import * as schema from "./schema";

const pool = postgres(env.POSTGRES_URL, { prepare: false });
const db = drizzle(pool, { schema });

export { db };

// [ ] Configurar conexión a supabase por el protocolo WebSocket con otro
// adaptador
/**
 * @maikelagm
 * Ver primera dicusión
 *
 * Discusiones relacionadas:
 *  >>> https://github.com/supabase/cli/issues/2474#issuecomment-2267649268
 *  - https://github.com/vercel/storage/issues/123
 *  - https://www.reddit.com/r/nextjs/comments/19aw42g/supabase_or_vercel_postgres/
 *  - https://supabase.com/blog/supavisor-postgres-connection-pooler
 *  - https://www.nodejsauto.com/2024/07/ha-supabasetry-2-highly-available.html
 *  - https://supabase.com/docs/guides/database/connecting-to-postgres
 *
 */
