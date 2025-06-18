import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
const prisma = new PrismaClient();
async function main() {
    const emailSchema = z.string().email();
    const adminEmail = emailSchema.parse(process.env.ADMIN_EMAIL);
    const adminPassword = process.env.ADMIN_PASSWORD;
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
    }
    else {
        console.log(`ℹ️ Compte admin existe déjà pour ${adminEmail}`);
    }
    const defaultCategories = [
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
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
