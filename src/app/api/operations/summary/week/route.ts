import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Calculer le début et la fin de la semaine
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Dimanche
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    endOfWeek.setHours(0, 0, 0, 0);

    // Récupérer toutes les opérations de la semaine
    const operations = await prisma.operation.findMany({
      where: {
        userId: parseInt(session.user.id),
        date: {
          gte: startOfWeek,
          lt: endOfWeek
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Calculer les totaux
    const totalIncome = operations
      .filter(op => op.type === 'income')
      .reduce((sum, op) => sum + op.amount, 0);

    const totalExpense = operations
      .filter(op => op.type === 'expense')
      .reduce((sum, op) => sum + op.amount, 0);

    // Grouper les opérations par jour
    const dailySummaries = Array.from({ length: 7 }, (_, i) => {
      const dayStart = new Date(startOfWeek);
      dayStart.setDate(startOfWeek.getDate() + i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);

      const dayOperations = operations.filter(op => 
        op.date >= dayStart && op.date < dayEnd
      );

      const dayIncome = dayOperations
        .filter(op => op.type === 'income')
        .reduce((sum, op) => sum + op.amount, 0);

      const dayExpense = dayOperations
        .filter(op => op.type === 'expense')
        .reduce((sum, op) => sum + op.amount, 0);

      return {
        date: dayStart.toISOString(),
        totalIncome: dayIncome,
        totalExpense: dayExpense,
        balance: dayIncome - dayExpense
      };
    });

    const summary = {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      dailySummaries
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching week summary:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération du résumé' },
      { status: 500 }
    );
  }
} 