import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: `https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=${process.env.GOOGLE_CLIENT_ID}&scope=openid+email+profile+${encodeURIComponent(GMAIL_SCOPE)}&access_type=offline&prompt=consent`,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id;
      }
      if (account?.provider === "google" && account.access_token) {
        // Save tokens to DB
        try {
          const userId = (user?.id || token.sub) as string;
          if (userId) {
            await prisma.user.update({
              where: { id: userId },
              data: {
                gmailAccessToken:  account.access_token,
                gmailRefreshToken: (account.refresh_token as string) ?? null,
                // Mark as connected if we have a refresh token (scope field unreliable in v5 beta)
                gmailConnected:    !!(account.refresh_token) || !!(account.scope?.includes("gmail")),
              },
            });
            // Also save refresh token to Account table
            if (account.refresh_token) {
              await prisma.account.updateMany({
                where: { userId, provider: "google" },
                data: { refresh_token: account.refresh_token as string },
              });
            }
          }
        } catch (e) {
          console.error("Failed to save tokens:", e);
        }
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      if (url.includes("/dashboard") || url === baseUrl || url === baseUrl + "/") {
        return baseUrl + "/api/auth/check-onboarding";
      }
      if (url.startsWith(baseUrl)) return url;
      return baseUrl + "/dashboard";
    },
  },
  pages: {
    signIn: "/login",
  },
});
