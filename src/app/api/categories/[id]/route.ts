import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

const updateCategorySchema = z.object({
  name: z.string().min(1, 'Le nom de la catégorie est requis'),
  type: z.enum(['income', 'expense']),
});

// GET - Récupérer une catégorie spécifique
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Vérifier si l'utilisateur est admin
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
  }

  try {
    const categoryId = parseInt(params.id);
    
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        operations: {
          select: {
            id: true,
            amount: true,
            type: true,
            date: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération de la catégorie' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une catégorie
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Vérifier si l'utilisateur est admin
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
  }

  try {
    const categoryId = parseInt(params.id);
    
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    }

    // Vérifier que la catégorie existe
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.errors }, { status: 400 });
    }

    const { name, type } = parsed.data;

    // Vérifier si le nom existe déjà (sauf pour cette catégorie)
    const existingCategoryWithName = await prisma.category.findFirst({
      where: {
        name,
        id: { not: categoryId },
      },
    });

    if (existingCategoryWithName) {
      return NextResponse.json({ error: 'Une catégorie avec ce nom existe déjà' }, { status: 400 });
    }

    // Mettre à jour la catégorie
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name,
        type,
      },
      include: {
        operations: {
          select: {
            id: true,
            amount: true,
            type: true,
            date: true,
          },
        },
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour de la catégorie' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une catégorie
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Vérifier si l'utilisateur est admin
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
  }

  try {
    const categoryId = parseInt(params.id);
    
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    }

    // Vérifier que la catégorie existe
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        operations: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Vérifier s'il y a des opérations liées à cette catégorie
    if (existingCategory.operations.length > 0) {
      return NextResponse.json({ 
        error: 'Impossible de supprimer cette catégorie car elle contient des opérations',
        operationsCount: existingCategory.operations.length
      }, { status: 400 });
    }

    // Supprimer la catégorie
    await prisma.category.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression de la catégorie' },
      { status: 500 }
    );
  }
} 