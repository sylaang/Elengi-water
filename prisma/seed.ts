import { PrismaClient } from '@prisma/client';
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });