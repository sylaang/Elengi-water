// src/api/operations/summary/day/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const operations = await prisma.operation.findMany({
      where: {
        userId: parseInt(session.user.id),
        date: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        category: true,
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    const totalIncome = operations
      .filter(op => op.type === 'income')
      .reduce((sum, op) => sum + op.amount, 0);

    const totalExpense = operations
      .filter(op => op.type === 'expense')
      .reduce((sum, op) => sum + op.amount, 0);

    const summary = {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      operations: operations.map(op => ({
        id: op.id,
        amount: op.amount,
        type: op.type,
        description: op.description || '',
        date: op.date.toISOString(),
        category: {
          id: op.category.id,
          name: op.category.name
        },
        user: {
          name: op.user.name
        }
      }))
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching day summary:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération du résumé' },
      { status: 500 }
    );
  }
} 