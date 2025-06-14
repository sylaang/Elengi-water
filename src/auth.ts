// src/auth.ts
import NextAuth from "next-auth"
import type { DefaultSession } from "next-auth"
import type { AuthConfig } from "@auth/core"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/app/lib/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import type { Adapter } from "@auth/core/adapters"
import type { JWT } from "next-auth/jwt"
import type { User } from "next-auth"
import type { AdapterUser } from "@auth/core/adapters"

// Extension des types de session NextAuth
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      role: Role
    } & DefaultSession["user"]
  }

  interface User {
    role: Role
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
const authConfig = {
  secret: process.env.AUTH_SECRET as string,
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Partial<Record<"email" | "password", unknown>>, request: Request): Promise<AuthUser | null> {
        console.log('Tentative de connexion avec:', credentials)
        
        const email = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined
        
        if (!email || !password) {
          throw new Error("Email et mot de passe requis")
        }
        
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            role: true,
            name: true,
            password: true,
          }
        })

        if (!user?.password) {
          throw new Error("Utilisateur non trouvé")
        }
        
        const isValid = await bcrypt.compare(
          password,
          user.password
        )

        if (!isValid) {
          throw new Error("Mot de passe incorrect")
        }

        console.log('Connexion réussie pour:', user.email)
        return {
          id: user.id.toString(),
          email: user.email,
          role: user.role as Role,
          name: user.name || null,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT, user: User | AdapterUser | null }) {
      if (user) {
        token.id = user.id
        token.role = (user as AuthUser).role
      }
      return token
    },
    async session({ session, token }: { session: any, token: any }) {
      if (token?.id) session.user.id = token.id as string
      if (token?.role) session.user.role = token.role as Role
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
    signOut: "/logout",
  },
  debug: process.env.NODE_ENV === "development",
} satisfies AuthConfig

// Export pour les API routes
export const { 
  handlers: { GET, POST }, 
  auth, 
  signIn, 
  signOut 
} = NextAuth(authConfig)

// Export pour la configuration manuelle
export const authOptions = authConfig