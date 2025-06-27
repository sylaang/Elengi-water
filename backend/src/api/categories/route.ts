// /app/api/categories/route.ts

import { prisma } from '@/app/lib/prisma';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { z } from 'zod';

const createCategorySchema = z.object({
  name: z.string().min(1, 'Le nom de la catégorie est requis'),
  type: z.enum(['income', 'expense']),
});

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      select: { id: true, name: true, type: true },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Vérifier si l'utilisateur est admin
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = createCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.errors }, { status: 400 });
    }

    const { name, type } = parsed.data;

    // Vérifier si une catégorie avec ce nom existe déjà
    const existingCategory = await prisma.category.findUnique({
      where: { name },
    });

    if (existingCategory) {
      return NextResponse.json({ error: 'Une catégorie avec ce nom existe déjà' }, { status: 400 });
    }

    // Créer la nouvelle catégorie
    const newCategory = await prisma.category.create({
      data: {
        name,
        type,
      },
      select: {
        id: true,
        name: true,
        type: true,
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de la catégorie' },
      { status: 500 }
    );
  }
}