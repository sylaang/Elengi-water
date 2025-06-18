import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Calculer le début et la fin du mois
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // Ajout de 1 pour avoir les mois de 1 à 12
    const startOfMonth = new Date(today.getFullYear(), currentMonth - 1, 1); // On soustrait 1 car new Date() attend 0-11
    const endOfMonth = new Date(today.getFullYear(), currentMonth, 0); // On utilise currentMonth car new Date() attend 0-11
    endOfMonth.setHours(23, 59, 59, 999);

    // Récupérer toutes les opérations du mois
    const operations = await prisma.operation.findMany({
      where: {
        userId: parseInt(session.user.id),
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      include: {
        category: true
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

    // Grouper les opérations par semaine
    const weeklySummaries = [];
    let currentWeekStart = new Date(startOfMonth);
    
    while (currentWeekStart <= endOfMonth) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(currentWeekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekOperations = operations.filter(op => 
        op.date >= currentWeekStart && op.date <= weekEnd
      );

      const weekIncome = weekOperations
        .filter(op => op.type === 'income')
        .reduce((sum, op) => sum + op.amount, 0);

      const weekExpense = weekOperations
        .filter(op => op.type === 'expense')
        .reduce((sum, op) => sum + op.amount, 0);

      weeklySummaries.push({
        weekStart: currentWeekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        totalIncome: weekIncome,
        totalExpense: weekExpense,
        balance: weekIncome - weekExpense,
        operations: weekOperations.map(op => ({
          id: op.id,
          amount: op.amount,
          type: op.type,
          description: op.description || '',
          date: op.date.toISOString(),
          category: {
            id: op.category.id,
            name: op.category.name
          }
        }))
      });

      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }

    const summary = {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      weeklySummaries
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching month summary:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération du résumé' },
      { status: 500 }
    );
  }
} 