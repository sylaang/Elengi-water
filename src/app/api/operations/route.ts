// /app/api/operations/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

const operationSchema = z.object({
  amount: z.number().positive(),
  categoryId: z.number(),
  type: z.enum(['income', 'expense']),
  description: z.string().optional(),
});

function getISOWeek(date: Date): number {
  const tmp = new Date(date.getTime());
  tmp.setHours(0, 0, 0, 0);
  tmp.setDate(tmp.getDate() + 4 - (tmp.getDay() || 7));
  const yearStart = new Date(tmp.getFullYear(), 0, 1);
  return Math.ceil((((tmp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// GET - Récupérer toutes les opérations (toutes pour admin, seulement les siennes pour user)
export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : 50;
    const offset = url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : 0;
    const userId = url.searchParams.get('userId') ? parseInt(url.searchParams.get('userId')!) : null;

    // Si l'utilisateur est admin, récupérer toutes les opérations
    // Sinon, récupérer seulement ses propres opérations
    let whereClause: any = {};
    
    if (session.user.role === 'ADMIN') {
      // Admin peut filtrer par utilisateur spécifique
      if (userId) {
        whereClause.userId = userId;
      }
    } else {
      // Utilisateur normal voit seulement ses opérations
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
            email: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
      take: limit,
      skip: offset,
    });

    const total = await prisma.operation.count({
      where: whereClause,
    });

    return NextResponse.json({
      operations: operations.map(op => ({
        id: op.id,
        amount: op.amount,
        type: op.type,
        description: op.description,
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
      })),
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching operations:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des opérations' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = operationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data', details: parsed.error.errors }, { status: 400 });
  }

  const { amount, categoryId, type, description } = parsed.data;

  try {
    const userId = parseInt(session.user.id);
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const week = getISOWeek(date);
    const formattedDate = date.toISOString().split('T')[0];

    const income = type === 'income' ? amount : 0;
    const expense = type === 'expense' ? amount : 0;
    const balance = income - expense;

    // ✅ ✅ ✅ ici avec date: new Date()
    const operation = await prisma.operation.create({
      data: {
        userId: parseInt(session.user.id),
        amount,
        categoryId,
        type,
        description,
        date: new Date(),
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    // Résumé journalier
    await prisma.dailySummary.upsert({
      where: {
        userId_date: {
          userId,
          date: new Date(formattedDate),
        },
      },
      update: {
        totalIncome: { increment: income },
        totalExpense: { increment: expense },
        balance: { increment: balance },
      },
      create: {
        userId,
        date: new Date(formattedDate),
        totalIncome: income,
        totalExpense: expense,
        balance,
      },
    });

    // Résumé hebdomadaire
    await prisma.weeklySummary.upsert({
      where: {
        userId_week_year: {
          userId,
          week,
          year,
        },
      },
      update: {
        totalIncome: { increment: income },
        totalExpense: { increment: expense },
        balance: { increment: balance },
      },
      create: {
        userId,
        week,
        year,
        totalIncome: income,
        totalExpense: expense,
        balance,
      },
    });

    // Résumé mensuel
    await prisma.monthlySummary.upsert({
      where: {
        userId_month_year: {
          userId,
          month,
          year,
        },
      },
      update: {
        totalIncome: { increment: income },
        totalExpense: { increment: expense },
        balance: { increment: balance },
      },
      create: {
        userId,
        month,
        year,
        totalIncome: income,
        totalExpense: expense,
        balance,
      },
    });

    return NextResponse.json(operation, { status: 201 });

  } catch (error) {
    if (error instanceof Error && process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        error: 'Server error',
        message: error.message,
        details: error,
      }, { status: 500 });
    }

    return NextResponse.json({
      error: "Une erreur est survenue lors de la création de l'opération",
    }, { status: 500 });
  }
}