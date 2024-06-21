import { prisma } from "@popshop/database";
import { NextAuthOptions, SessionStrategy } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";
import { SiweMessage } from "siwe";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt" as SessionStrategy,
  },
  providers: [
    CredentialsProvider({
      name: "Wallet",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
      },
      async authorize(credentials, req) {
        try {
          const siwe = new SiweMessage(
            JSON.parse(credentials?.message || "{}"),
          );
          // eslint-disable-next-line turbo/no-undeclared-env-vars
          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL!);

          const result = await siwe.verify({
            signature: credentials?.signature || "",
            domain: nextAuthUrl.host,
            nonce: await getCsrfToken({ req }),
          });

          if (!result.success) {
            return null;
          }
          const user = await prisma.user.findUnique({
            where: {
              evmAddress: siwe.address.toLowerCase(),
            },
          });
          if (!user) {
            // create backend evm wallet
            const newUser = await prisma.user.create({
              data: {
                evmAddress: siwe.address.toLowerCase(),
              },
            });

            return newUser;
          }
          return user;
        } catch (e) {
          console.error(e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      session.user.id = token.sub;
      session.user.evmAddress = token.evmAddress;
      session.user.custodialAddress = token.custodialAddress;
      session.user.image = token.picture;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.evmAddress = user.evmAddress;
        token.picture = user.imageUrl;
        token.custodialAddress = user.custodialAddress;
      }
      return token;
    },
  },
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  secret: process.env.NEXTAUTH_SECRET,
};
