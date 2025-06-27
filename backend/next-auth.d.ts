import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: number;
      email: string;
      name?: string;
      image?: string;
      role?: 'ADMIN' | 'USER';
    };
  }
  interface User {
    id: number;
    email: string;
    name?: string;
    image?: string;
    role?: 'ADMIN' | 'USER';
  }
} 