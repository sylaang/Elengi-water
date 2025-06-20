// src/api/operations/summary/day/route.ts
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
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);


    let whereClause: any = {
      date: {
        gte: today,
        lt: tomorrow
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
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
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
          name: op.category.name
        },
        user: {
          id: op.user.id,
          name: op.user.name,
          email: op.user.email
        }
      })),
      isAdmin: session.user.role === 'ADMIN',
      totalOperations: operations.length,
      filteredByUser: userId
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