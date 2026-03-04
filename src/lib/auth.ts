import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";
import { Role } from "@/models/Role";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password diperlukan");
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email });

        if (!user || !user.password) {
          throw new Error("User tidak ditemukan atau password belum diatur");
        }

        let isValid = false;

        if (user.password.startsWith("$2")) {
            isValid = await bcrypt.compare(credentials.password, user.password);
        } else {
            const hash = crypto.createHash('sha256').update(credentials.password).digest('hex');
            if (hash === user.password) {
                isValid = true;
            }
        }

        if (!isValid) {
          throw new Error("Password salah");
        }

        const role = await Role.findOne({ name: user.role });

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: role?.permissions || [],
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role || '';
        session.user.id = token.id || '';
        session.user.permissions = token.permissions || [];
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "rahasia-baznaz-123",
};
