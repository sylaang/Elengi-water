// src/app/lib/middleware/admin-auth.ts
import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function withAdminAuth(callback: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès refusé: droits insuffisants" },
        { status: 403 }
      )
    }

    return callback(req)
  }
}