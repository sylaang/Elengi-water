// /app/api/operations/summary/route.ts

import { prisma } from '@/app/lib/prisma';
import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns';

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const period = url.searchParams.get('period') || 'month';

  const now = new Date();
  let start: Date;
  let end: Date;

  switch (period) {
    case 'day':
      start = startOfDay(now);
      end = endOfDay(now);
      break;
    case 'week':
      start = startOfWeek(now, { weekStartsOn: 1 }); // Lundi début de semaine
      end = endOfWeek(now, { weekStartsOn: 1 });
      break;
    case 'month':
    default:
      start = startOfMonth(now);
      end = endOfMonth(now);
      break;
  }

  const operations = await prisma.operation.findMany({
    where: {
      userId: parseInt(session.user.id),
      date: {
        gte: start,
        lte: end,
      },
    },
  });

  const income = operations
    .filter((op) => op.type === 'income')
    .reduce((sum, op) => sum + op.amount, 0);

  const expense = operations
    .filter((op) => op.type === 'expense')
    .reduce((sum, op) => sum + op.amount, 0);

  return NextResponse.json({
    totalIncome: income,
    totalExpense: expense,
    balance: income - expense,
  });
}
