// src/auth.ts
import NextAuth, { type NextAuthOptions, type DefaultSession, type User } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./src/lib/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

// Extension des types de session NextAuth
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      role: Role
    } & DefaultSession["user"]
  }

  interface User {
    role?: Role
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string
    role: Role
  }
}

type Role = "ADMIN" | "USER"

interface Credentials {
  email?: string
  password?: string
}

interface AuthUser {
  id: string
  email: string
  role: Role
  name?: string | null
}

// Configuration de base typée
export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const email = credentials?.email
        const password = credentials?.password
        if (!email || !password) throw new Error("Email et mot de passe requis")
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user?.password) throw new Error("Utilisateur non trouvé")
        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) throw new Error("Mot de passe incorrect")
        return { id: user.id.toString(), email: user.email, role: user.role, name: user.name }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token?.id) session.user.id = token.id as string
      if (token?.role) session.user.role = token.role as Role
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  debug: process.env.NODE_ENV === "development",
}

export default NextAuth(authOptions)

// Export pour les API routes
export const { 
  handlers: { GET, POST }, 
  auth, 
  signIn, 
  signOut 
} = NextAuth(authOptions)