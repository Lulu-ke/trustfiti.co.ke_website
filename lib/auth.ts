import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    // Phone OTP (existing)
    CredentialsProvider({
      id: "phone",
      name: "Phone OTP",
      credentials: {
        phoneNumber: { label: "Phone Number", type: "text" },
        otpCode: { label: "OTP Code", type: "text" },
        sessionToken: { label: "Session Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phoneNumber || !credentials?.sessionToken) {
          return null;
        }

        // Find or create user by phone number
        let user = await prisma.user.findUnique({
          where: { phoneNumber: credentials.phoneNumber },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              phoneNumber: credentials.phoneNumber,
              role: "REVIEWER",
              isVerified: true,
            },
          });
        }

        if (!user.isActive) {
          throw new Error("Account is deactivated");
        }

        return {
          id: user.id,
          name: user.fullName,
          email: user.email,
          image: user.avatar,
          role: user.role,
          phoneNumber: user.phoneNumber,
        };
      },
    }),

    // Email/Password
    CredentialsProvider({
      id: "email",
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        action: { label: "Action", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const { email, password, action } = credentials;

        if (action === "register") {
          // Registration is handled via the API endpoint, not here.
          // This provider only handles login.
          return null;
        }

        // Login: find user by email
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        if (!user.isActive) {
          throw new Error("Account is deactivated");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          name: user.fullName,
          email: user.email,
          image: user.avatar,
          role: user.role,
          phoneNumber: user.phoneNumber,
        };
      },
    }),

    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as any).role;
        token.phoneNumber = (user as any).phoneNumber;
        token.id = user.id;
      }
      if (account?.provider === "google" && account.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).phoneNumber = token.phoneNumber;
        (session.user as any).id = token.id;
        if (token.accessToken) {
          (session.user as any).accessToken = token.accessToken;
        }
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Handle Google OAuth account linking
      if (account?.provider === "google" && profile?.email) {
        const email = profile.email.toLowerCase();

        // Check if a user with this email already exists
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          // Link Google account to existing user
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              googleId: account.providerAccountId,
              avatar: existingUser.avatar || (profile as Record<string, unknown>).picture as string || null,
              isVerified: true,
            },
          });
          // Override the user id so NextAuth uses the existing user
          user.id = existingUser.id;
        } else {
          // Create new user from Google account
          // We need a unique phone number — generate a placeholder since
          // the phoneNumber field is required and unique.
          const placeholderPhone = `google_${account.providerAccountId.slice(0, 15)}`;
          const newUser = await prisma.user.create({
            data: {
              email,
              googleId: account.providerAccountId,
              fullName: profile.name || null,
              avatar: (profile as Record<string, unknown>).picture as string || null,
              phoneNumber: placeholderPhone,
              role: "REVIEWER",
              isVerified: true,
            },
          });
          user.id = newUser.id;
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
