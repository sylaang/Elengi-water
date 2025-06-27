import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '../../../../auth'
import { z } from 'zod'

export const runtime = 'nodejs'

const updateCategorySchema = z.object({
  name: z.string().min(1, 'Le nom de la catégorie est requis'),
  type: z.enum(['income', 'expense']),
})

export async function GET(request: NextRequest, { params }: any): Promise<NextResponse> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const categoryId = parseInt(params.id);
  if (isNaN(categoryId)) {
    return NextResponse.json({ error: 'ID de catégorie invalide' }, { status: 400 });
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { operations: true }
  });

  return category
    ? NextResponse.json(category)
    : NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 });
}

export async function PUT(request: NextRequest, { params }: any): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const categoryId = parseInt(params.id);
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    const body = await request.json();
    const result = updateCategorySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: result.error.errors },
        { status: 400 }
      );
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: result.data,
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('[UPDATE_ERROR]', error);
    return NextResponse.json(
      { error: 'Échec de la mise à jour' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: any): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const categoryId = parseInt(params.id);
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE_ERROR]', error);
    return NextResponse.json(
      { error: 'Échec de la suppression' },
      { status: 500 }
    );
  }
}