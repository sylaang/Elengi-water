import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@/auth';

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') ? parseInt(url.searchParams.get('userId')!) : null;

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    let whereClause: any = {
      date: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    };

    if (session.user.role === 'ADMIN') {
      if (userId) {
        whereClause.userId = userId;
      }
    } else {
      whereClause.userId = parseInt(session.user.id);
    }

    const operations = await prisma.operation.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: true
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

    const weeklySummaries = [];
    let currentWeekStart = new Date(startOfMonth);

    while (currentWeekStart <= endOfMonth) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(currentWeekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      // Clamp weekEnd à endOfMonth pour la dernière semaine
      if (weekEnd > endOfMonth) {
        weekEnd.setTime(endOfMonth.getTime());
      }

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
          },
          user: {
            id: op.user.id,
            name: op.user.name,
            email: op.user.email
          }
        }))
      });

      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }
    
    const exportableOperations = operations.map(op => ({
      date: op.date.toISOString(),
      description: op.description || '',
      amount: op.amount,
      type: op.type,
      user: op.user?.name ?? '',
      category: op.category?.name ?? ''
    }));

    const summary = {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      weeklySummaries,
      isAdmin: session.user.role === 'ADMIN',
      totalOperations: operations.length,
      filteredByUser: userId,
      operations: exportableOperations
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
