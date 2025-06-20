import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

const updateOperationSchema = z.object({
  amount: z.number().positive().optional(),
  categoryId: z.number().optional(),
  type: z.enum(['income', 'expense']).optional(),
  description: z.string().optional(),
  date: z.string().optional(),
});

function getISOWeek(date: Date): number {
  const tmp = new Date(date.getTime());
  tmp.setHours(0, 0, 0, 0);
  tmp.setDate(tmp.getDate() + 4 - (tmp.getDay() || 7));
  const yearStart = new Date(tmp.getFullYear(), 0, 1);
  return Math.ceil((((tmp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// GET - Récupérer une opération spécifique
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const operationId = parseInt(params.id);
    
    if (isNaN(operationId)) {
      return NextResponse.json({ error: 'Invalid operation ID' }, { status: 400 });
    }

    // Si l'utilisateur est admin, récupérer l'opération sans filtre par userId
    // Sinon, récupérer seulement ses propres opérations
    const whereClause = session.user.role === 'ADMIN' 
      ? { id: operationId }
      : { id: operationId, userId: parseInt(session.user.id) };

    const operation = await prisma.operation.findFirst({
      where: whereClause,
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!operation) {
      return NextResponse.json({ error: 'Operation not found' }, { status: 404 });
    }

    return NextResponse.json(operation);
  } catch (error) {
    console.error('Error fetching operation:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération de l\'opération' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une opération
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const operationId = parseInt(params.id);
    
    if (isNaN(operationId)) {
      return NextResponse.json({ error: 'Invalid operation ID' }, { status: 400 });
    }

    // Si l'utilisateur est admin, vérifier que l'opération existe sans filtre par userId
    // Sinon, vérifier que l'opération appartient à l'utilisateur
    const whereClause = session.user.role === 'ADMIN' 
      ? { id: operationId }
      : { id: operationId, userId: parseInt(session.user.id) };

    const existingOperation = await prisma.operation.findFirst({
      where: whereClause,
    });

    if (!existingOperation) {
      return NextResponse.json({ error: 'Operation not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateOperationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.errors }, { status: 400 });
    }

    const updateData = parsed.data;

    // Mettre à jour l'opération
    const updatedOperation = await prisma.operation.update({
      where: { id: operationId },
      data: {
        ...(updateData.amount !== undefined && { amount: updateData.amount }),
        ...(updateData.categoryId !== undefined && { categoryId: updateData.categoryId }),
        ...(updateData.type !== undefined && { type: updateData.type }),
        ...(updateData.description !== undefined && { description: updateData.description }),
        ...(updateData.date !== undefined && { date: new Date(updateData.date) }),
      },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Recalculer tous les résumés (jour, semaine, mois) de l'opération
    await recalculateSummaries(existingOperation.userId, existingOperation.date);

    return NextResponse.json(updatedOperation);
  } catch (error) {
    console.error('Error updating operation:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour de l\'opération' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une opération
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const operationId = parseInt(params.id);
    
    if (isNaN(operationId)) {
      return NextResponse.json({ error: 'Invalid operation ID' }, { status: 400 });
    }

    // Si l'utilisateur est admin, vérifier que l'opération existe sans filtre par userId
    // Sinon, vérifier que l'opération appartient à l'utilisateur
    const whereClause = session.user.role === 'ADMIN' 
      ? { id: operationId }
      : { id: operationId, userId: parseInt(session.user.id) };

    const existingOperation = await prisma.operation.findFirst({
      where: whereClause,
    });

    if (!existingOperation) {
      return NextResponse.json({ error: 'Operation not found' }, { status: 404 });
    }

    // Supprimer l'opération
    await prisma.operation.delete({
      where: { id: operationId },
    });

    // Recalculer tous les résumés (jour, semaine, mois) de l'opération
    await recalculateSummaries(existingOperation.userId, existingOperation.date);

    return NextResponse.json({ message: 'Operation deleted successfully' });
  } catch (error) {
    console.error('Error deleting operation:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression de l\'opération' },
      { status: 500 }
    );
  }
}

// Fonction utilitaire pour recalculer les résumés
async function recalculateSummaries(userId: number, operationDate: Date) {
  const year = operationDate.getFullYear();
  const month = operationDate.getMonth() + 1;
  const week = getISOWeek(operationDate);
  const formattedDate = operationDate.toISOString().split('T')[0];

  // Recalculer le résumé journalier
  const dayOperations = await prisma.operation.findMany({
    where: {
      userId,
      date: {
        gte: new Date(formattedDate),
        lt: new Date(new Date(formattedDate).getTime() + 24 * 60 * 60 * 1000),
      },
    },
  });

  const dayIncome = dayOperations
    .filter(op => op.type === 'income')
    .reduce((sum, op) => sum + op.amount, 0);
  const dayExpense = dayOperations
    .filter(op => op.type === 'expense')
    .reduce((sum, op) => sum + op.amount, 0);

  await prisma.dailySummary.upsert({
    where: {
      userId_date: {
        userId,
        date: new Date(formattedDate),
      },
    },
    update: {
      totalIncome: dayIncome,
      totalExpense: dayExpense,
      balance: dayIncome - dayExpense,
    },
    create: {
      userId,
      date: new Date(formattedDate),
      totalIncome: dayIncome,
      totalExpense: dayExpense,
      balance: dayIncome - dayExpense,
    },
  });

  // Recalculer le résumé hebdomadaire
  const weekStart = new Date(operationDate);
  weekStart.setDate(operationDate.getDate() - operationDate.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const weekOperations = await prisma.operation.findMany({
    where: {
      userId,
      date: {
        gte: weekStart,
        lt: weekEnd,
      },
    },
  });

  const weekIncome = weekOperations
    .filter(op => op.type === 'income')
    .reduce((sum, op) => sum + op.amount, 0);
  const weekExpense = weekOperations
    .filter(op => op.type === 'expense')
    .reduce((sum, op) => sum + op.amount, 0);

  await prisma.weeklySummary.upsert({
    where: {
      userId_week_year: {
        userId,
        week,
        year,
      },
    },
    update: {
      totalIncome: weekIncome,
      totalExpense: weekExpense,
      balance: weekIncome - weekExpense,
    },
    create: {
      userId,
      week,
      year,
      totalIncome: weekIncome,
      totalExpense: weekExpense,
      balance: weekIncome - weekExpense,
    },
  });

  // Recalculer le résumé mensuel
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);
  monthEnd.setHours(23, 59, 59, 999);

  const monthOperations = await prisma.operation.findMany({
    where: {
      userId,
      date: {
        gte: monthStart,
        lte: monthEnd,
      },
    },
  });

  const monthIncome = monthOperations
    .filter(op => op.type === 'income')
    .reduce((sum, op) => sum + op.amount, 0);
  const monthExpense = monthOperations
    .filter(op => op.type === 'expense')
    .reduce((sum, op) => sum + op.amount, 0);

  await prisma.monthlySummary.upsert({
    where: {
      userId_month_year: {
        userId,
        month,
        year,
      },
    },
    update: {
      totalIncome: monthIncome,
      totalExpense: monthExpense,
      balance: monthIncome - monthExpense,
    },
    create: {
      userId,
      month,
      year,
      totalIncome: monthIncome,
      totalExpense: monthExpense,
      balance: monthIncome - monthExpense,
    },
  });
} 