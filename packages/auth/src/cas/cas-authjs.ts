import type {
  Account as NextAuthAccount,
  User as NextAuthUser,
} from "next-auth";
import { Adapter, AdapterUser } from "next-auth/adapters";
import { JWT } from "next-auth/jwt";

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
    const dbUser = await db
      .select()
      .from(User)
      .where(eq(User.email, user.email!));
    if (dbUser[0]?.id) {
      await tx
        .update(User)
        .set({
          name: user.name,
          image: user.image,
        })
        .where(eq(User.id, dbUser[0].id));
    } else {
      const newUser = await tx
        .insert(User)
        .values({
          name: user.name!,
          email: user.email!,
          emailVerified: null,
          image: user.image!,
        })
        .returning();
      await tx.insert(Account).values({
        // @ts-ignore
        userId: newUser[0].id,
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

  const dbUser = await db
    .select()
    .from(User)
    .where(eq(User.email, user.email!));

  if (account?.provider === "cas" && dbUser[0]?.id) {
    const session = await adapter.createSession!({
      userId: dbUser[0].id,
      sessionToken,
      expires,
      // @ts-ignore
      currentProvider: account.provider,
    });

    token.sessionId = session.sessionToken;
  }
}
