// src\app\api\operations\summary\week

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
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); 
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    endOfWeek.setHours(0, 0, 0, 0);


    let whereClause: any = {
      date: {
        gte: startOfWeek,
        lt: endOfWeek
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
        category: {
          select: {
            id: true,
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
        balance: dayIncome - dayExpense,
        operationsCount: dayOperations.length
      };
    });

    const exportableOperations = operations.map(op => ({
      date: op.date.toISOString(),
      description: op.description || '',
      amount: op.amount,
      type: op.type,
      user: op.user?.name ?? '',
      category: op.category?.name ?? '',
    }));

    const summary = {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      dailySummaries,
      isAdmin: session.user.role === 'ADMIN',
      totalOperations: operations.length,
      filteredByUser: userId,
      operations: exportableOperations
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