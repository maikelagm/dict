import type {
  Account as NextAuthAccount,
  User as NextAuthUser,
} from "next-auth";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import type { JWT } from "next-auth/jwt";

import { eq } from "@dict/db";
import { db } from "@dict/db/client";
import { Account, User } from "@dict/db/schema";

export async function syncCasUserAccount({
  account,
  user,
}: {
  account: NextAuthAccount;
  user: NextAuthUser | AdapterUser;
}) {
  await db.transaction(async (tx) => {
    if (!user.email) {
      throw new Error("User email is required");
    }
    const dbUser = await db
      .select()
      .from(User)
      .where(eq(User.email, user.email));
    if (dbUser[0]?.id) {
      await tx
        .update(User)
        .set({
          name: user.name,
          image: user.image,
        })
        .where(eq(User.id, dbUser[0].id));
    } else {
      if (!user.email && !user.name && !user.image) {
        throw new Error("User email, name, and image are required");
      }
      const newUser = await tx
        .insert(User)
        .values({
          name: user.name,
          email: user.email,
          emailVerified: null,
          image: user.image,
        })
        .returning({ insertedId: User.id });

      if (!newUser[0]?.insertedId) {
        throw new Error("Failed to insert user");
      }

      await tx.insert(Account).values({
        // @ts-expect-error: userID y newAccount[0].insertId al parecer no son compatibles
        userId: newUser[0].insertedId,
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        refresh_token: account.refresh_token,
        access_token: account.access_token,
        expires_at: account.expires_at,
        token_type: account.token_type,
        scope: account.scope,
        id_token: account.id_token,
        session_state: account.session_state,
      });
    }
  });
}

export async function createCasSession({
  user,
  account,
  token,
  adapter,
}: {
  user: NextAuthUser | AdapterUser;
  account: NextAuthAccount;
  token: JWT;
  adapter: Adapter;
}) {
  const expires = new Date(Date.now() + 60 * 60 * 24 * 30 * 1000);
  const sessionToken = crypto.randomUUID();

  if (!user.email) {
    throw new Error("User email is required");
  }

  const dbUser = await db.select().from(User).where(eq(User.email, user.email));

  if (account.provider === "cas" && dbUser[0]?.id) {
    if (adapter.createSession) {
      const session = await adapter.createSession({
        // [ ] fix: 'currentProvider' does not exist in type '{ sessionToken: string; userId: string; expires: Date; }'
        // @ts-expect-error 'currentProvider' no existe en el tipo '{ sessionToken: string; userId: string; expires: Date; }'
        currentProvider: account.provider,
        userId: dbUser[0].id,
        sessionToken,
        expires,
      });

      token.sessionId = session.sessionToken;
    } else {
      throw new Error("Adapter does not support session creation");
    }
  }
}
