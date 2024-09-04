import type {
  DefaultSession,
  NextAuthConfig,
  Session as NextAuthSession,
} from "next-auth";
import { skipCSRFCheck } from "@auth/core";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { encode } from "next-auth/jwt";
import Google from "next-auth/providers/google";

import { eq } from "@dict/db";
import { db } from "@dict/db/client";
import { Account, Session, User } from "@dict/db/schema";

import { env } from "../env";
import { createCasSession, syncCasUserAccount } from "./cas/cas-authjs";
import { CAS } from "./cas/cas-client";

declare module "next-auth" {
  interface Session {
    currentProvider: string;
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

const adapter = DrizzleAdapter(db, {
  usersTable: User,
  accountsTable: Account,
  sessionsTable: Session,
});

export const isSecureContext = env.NODE_ENV !== "development";

export const authConfig = {
  adapter,
  // In development, we need to skip checks to allow Expo to work
  ...(!isSecureContext
    ? {
        skipCSRFCheck: skipCSRFCheck,
        trustHost: true,
      }
    : {
        //  en Preview es necesario trusHost
        trustHost: true,
      }),
  secret: env.AUTH_SECRET,
  providers: [
    Google({
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CAS,
  ],
  jwt: {
    maxAge: 60 * 60 * 24 * 30,
    async encode(arg) {
      return (arg.token?.sessionId as string) ?? encode(arg);
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "cas") {
        await syncCasUserAccount({
          user,
          account,
        });
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "cas") {
        await createCasSession({
          user,
          account,
          token,
          adapter,
        });
      }
      return token;
    },
    session: (opts) => {
      if (!("user" in opts))
        throw new Error("unreachable with session strategy");

      return {
        ...opts.session,
        user: {
          ...opts.session.user,
          id: opts.user.id,
        },
      };
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/new-user",
  },
  events: {
    async signOut(message) {
      if ("session" in message && message.session?.sessionToken) {
        await db
          .delete(Session)
          .where(eq(Session.sessionToken, message.session?.sessionToken));
      }
    },
  },
} satisfies NextAuthConfig;

export const validateToken = async (
  token: string,
): Promise<NextAuthSession | null> => {
  const sessionToken = token.slice("Bearer ".length);
  const session = await adapter.getSessionAndUser?.(sessionToken);
  return session
    ? {
        //@ts-ignore
        currentProvider: session.currentProvider,
        user: {
          ...session.user,
        },
        expires: session.session.expires.toISOString(),
      }
    : null;
};

export const invalidateSessionToken = async (token: string) => {
  await adapter.deleteSession?.(token);
};
