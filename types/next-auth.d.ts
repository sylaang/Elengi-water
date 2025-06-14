// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";

export type UserRole = "ADMIN" | "USER"; // Ajout du 'export'

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}