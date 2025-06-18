import { PrismaClient, OperationType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const prisma = new PrismaClient();

async function main() {
  const emailSchema = z.string().email();
  const adminEmail = emailSchema.parse(process.env.ADMIN_EMAIL);
  const adminPassword = process.env.ADMIN_PASSWORD!;

  const adminExists = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!adminExists) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Administrateur',
        password: await bcrypt.hash(adminPassword, 12),
        role: 'ADMIN',
      },
    });
    console.log(`✅ Compte admin créé pour ${adminEmail}`);
  } else {
    console.log(`ℹ️ Compte admin existe déjà pour ${adminEmail}`);
  }

  const defaultCategories: { name: string; type: OperationType }[] = [
    { name: 'Carburant - Livraison', type: 'expense' },
    { name: 'Carburant - Matériel', type: 'expense' },
    { name: 'Carburant - Groupe électrogène', type: 'expense' },
    { name: 'Salaires - Nadine', type: 'expense' },
    { name: 'Salaires - Moïse', type: 'expense' },
    { name: 'Salaires - Jean Pierre', type: 'expense' },
    { name: 'Fourniture - Bidon', type: 'expense' },
    { name: 'Fourniture - Bouchon', type: 'expense' },
    { name: 'Fourniture - Tempête', type: 'expense' },
    { name: 'Fourniture - Étiquette', type: 'expense' },
    { name: 'Fourniture - Savon', type: 'expense' },
    { name: 'Fourniture - Chiffon', type: 'expense' },
    { name: 'Fourniture - Bicarbonate', type: 'expense' },
    { name: 'Fourniture - Éponge', type: 'expense' },
    { name: 'Fourniture - Goupillon', type: 'expense' },
    { name: 'Fourniture - Bassine', type: 'expense' },
    { name: 'Fourniture - Valise sachets eau', type: 'expense' },
    { name: 'Fourniture - Emballage sachets', type: 'expense' },
    { name: 'Fourniture - Filtre eau', type: 'expense' },
    { name: 'Revenus - Paiement service', type: 'income' },
    { name: 'Autres dépenses', type: 'expense' },
  ];

  for (const category of defaultCategories) {
    const exists = await prisma.category.findUnique({
      where: { name: category.name },
    });

    if (!exists) {
      await prisma.category.create({
        data: category,
      });
      console.log(`✅ Catégorie ajoutée : ${category.name}`);
    }
  }

  const admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!admin) {
    throw new Error('Admin user not found after creation.');
  }

  // Ajout de DailySummary
  await prisma.dailySummary.upsert({
    where: {
      userId_date: {
        userId: admin.id,
        date: new Date('2025-06-17'),
      },
    },
    update: {},
    create: {
      userId: admin.id,
      date: new Date('2025-06-17'),
      totalIncome: 100,
      totalExpense: 30,
      balance: 70,
    },
  });
  console.log('✅ DailySummary ajouté');

  // Ajout de WeeklySummary
  await prisma.weeklySummary.upsert({
    where: {
      userId_week_year: {
        userId: admin.id,
        week: 25,
        year: 2025,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      week: 25,
      year: 2025,
      totalIncome: 400,
      totalExpense: 150,
      balance: 250,
    },
  });
  console.log('✅ WeeklySummary ajouté');

  // Ajout de MonthlySummary
  await prisma.monthlySummary.upsert({
    where: {
      userId_month_year: {
        userId: admin.id,
        month: 6,
        year: 2025,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      month: 6,
      year: 2025,
      totalIncome: 1000,
      totalExpense: 600,
      balance: 400,
    },
  });
  console.log('✅ MonthlySummary ajouté');

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
