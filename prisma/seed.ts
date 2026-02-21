import * as argon2 from 'argon2';
import { PrismaClient, Role } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const prismaAny = prisma as any;
  const adminPassword = await argon2.hash('Admin123!');
  const customerPassword = await argon2.hash('Customer123!');

  await prisma.user.upsert({
    where: { email: 'admin@pizzainpizza.local' },
    update: {},
    create: {
      email: 'admin@pizzainpizza.local',
      passwordHash: adminPassword,
      name: 'Admin User',
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: 'customer@pizzainpizza.local' },
    update: {},
    create: {
      email: 'customer@pizzainpizza.local',
      passwordHash: customerPassword,
      name: 'Customer User',
      role: Role.CUSTOMER,
    },
  });

  const zone = await prismaAny.deliveryZone.upsert({
    where: { id: 'default-zone' },
    update: {},
    create: {
      id: 'default-zone',
      name: 'Zona Central',
      fee: 8.5,
      minOrderValue: 25,
      isActive: true,
    },
  });

  await prismaAny.neighborhood.upsert({
    where: { id: 'default-neighborhood' },
    update: {},
    create: {
      id: 'default-neighborhood',
      name: 'Centro',
      deliveryZoneId: zone.id,
      isActive: true,
    },
  });
}

main().finally(async () => {
  await prisma.$disconnect();
});
