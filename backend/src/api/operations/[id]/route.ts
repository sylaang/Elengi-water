import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '../../../../auth';
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
export async function GET(request: NextRequest, { params }: any): Promise<NextResponse> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = typeof session.user.id === 'string' ? parseInt(session.user.id) : session.user.id;
  const operationId = parseInt(params.id);
  
  if (isNaN(operationId)) {
    return NextResponse.json({ error: 'Invalid operation ID' }, { status: 400 });
  }

  try {
    const whereClause = session.user.role === 'ADMIN'
      ? { id: operationId }
      : { id: operationId, userId };

    const operation = await prisma.operation.findFirst({
      where: whereClause,
      include: {
        category: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!operation) {
      return NextResponse.json({ error: 'Operation not found' }, { status: 404 });
    }

    return NextResponse.json(operation);
  } catch (error) {
    console.error('Error fetching operation:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération' }, { status: 500 });
  }
}

// PUT - Mettre à jour une opération
export async function PUT(request: NextRequest, { params }: any): Promise<NextResponse> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = typeof session.user.id === 'string' ? parseInt(session.user.id) : session.user.id;
  const operationId = parseInt(params.id);

  if (isNaN(operationId)) {
    return NextResponse.json({ error: 'Invalid operation ID' }, { status: 400 });
  }

  try {
    const whereClause = session.user.role === 'ADMIN'
      ? { id: operationId }
      : { id: operationId, userId };

    const existingOperation = await prisma.operation.findFirst({ where: whereClause });

    if (!existingOperation) {
      return NextResponse.json({ error: 'Operation not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateOperationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.errors }, { status: 400 });
    }

    const updateData = parsed.data;

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
        user: { select: { id: true, name: true, email: true } },
      },
    });

    await recalculateSummaries(existingOperation.userId, existingOperation.date);

    return NextResponse.json(updatedOperation);
  } catch (error) {
    console.error('Error updating operation:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}

// DELETE - Supprimer une opération
export async function DELETE(request: NextRequest, { params }: any): Promise<NextResponse> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = typeof session.user.id === 'string' ? parseInt(session.user.id) : session.user.id;
  const operationId = parseInt(params.id);

  if (isNaN(operationId)) {
    return NextResponse.json({ error: 'Invalid operation ID' }, { status: 400 });
  }

  try {
    const whereClause = session.user.role === 'ADMIN'
      ? { id: operationId }
      : { id: operationId, userId };

    const existingOperation = await prisma.operation.findFirst({ where: whereClause });

    if (!existingOperation) {
      return NextResponse.json({ error: 'Operation not found' }, { status: 404 });
    }

    await prisma.operation.delete({ where: { id: operationId } });

    await recalculateSummaries(existingOperation.userId, existingOperation.date);

    return NextResponse.json({ message: 'Operation deleted successfully' });
  } catch (error) {
    console.error('Error deleting operation:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}

// Fonction utilitaire pour recalculer les résumés
async function recalculateSummaries(userId: number, operationDate: Date) {
  const year = operationDate.getFullYear();
  const month = operationDate.getMonth() + 1;
  const week = getISOWeek(operationDate);
  const formattedDate = operationDate.toISOString().split('T')[0];

  // Résumé journalier
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
    .filter((op: { type: string }) => op.type === 'income')
    .reduce((sum: number, op: { amount: number }) => sum + op.amount, 0);

  const dayExpense = dayOperations
    .filter((op: { type: string }) => op.type === 'expense')
    .reduce((sum: number, op: { amount: number }) => sum + op.amount, 0);

  await prisma.dailySummary.upsert({
    where: { userId_date: { userId, date: new Date(formattedDate) } },
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

  // Résumé hebdomadaire
  const weekStart = new Date(operationDate);
  weekStart.setDate(operationDate.getDate() - operationDate.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const weekOperations = await prisma.operation.findMany({
    where: {
      userId,
      date: { gte: weekStart, lt: weekEnd },
    },
  });

  const weekIncome = weekOperations
    .filter((op: { type: string }) => op.type === 'income')
    .reduce((sum: number, op: { amount: number }) => sum + op.amount, 0);

  const weekExpense = weekOperations
    .filter((op: { type: string }) => op.type === 'expense')
    .reduce((sum: number, op: { amount: number }) => sum + op.amount, 0);

  await prisma.weeklySummary.upsert({
    where: { userId_week_year: { userId, week, year } },
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

  // Résumé mensuel
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);
  monthEnd.setHours(23, 59, 59, 999);

  const monthOperations = await prisma.operation.findMany({
    where: {
      userId,
      date: { gte: monthStart, lte: monthEnd },
    },
  });

  const monthIncome = monthOperations
    .filter((op: { type: string }) => op.type === 'income')
    .reduce((sum: number, op: { amount: number }) => sum + op.amount, 0);

  const monthExpense = monthOperations
    .filter((op: { type: string }) => op.type === 'expense')
    .reduce((sum: number, op: { amount: number }) => sum + op.amount, 0);

  await prisma.monthlySummary.upsert({
    where: { userId_month_year: { userId, month, year } },
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
