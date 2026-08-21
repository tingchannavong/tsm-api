console.log("SCRIPT STARTED");

import prisma from "../src/libs/prismaClient.js";
import bcrypt from "bcrypt";

async function main() {
  // await prisma.sessionRecord.deleteMany({ where: { status: {in: ['ACTIVE', 'ENDED'] }} }); 
   await prisma.unit.create({
    data: {
      name: "Hourly"
    },
  });

    await prisma.currency.create({
    data: {
      name: "Thai Baht",
      code: "THB",
      symbol: "฿"
    },
  });

   await prisma.pricing.create({
    data: {
      name: "Hourly",
      currencyId: 1,
      unitId: 1,
      price: 1.23
    },
  });

   for (let i = 1; i <= 6; i++) {
    const tableName = `Table-${i}`;
    const tableDisplayName = `T${i}`;

    const location = await prisma.location.upsert({
      where: { name: tableName },
      update: {
        displayName: tableDisplayName,
      },
      create: {
        name: tableName,
        displayName: tableDisplayName,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${tableName}`, // Optional dummy QR code link
      },
    });

    console.log(`Seeded: ${location.displayName} (${location.id})`);
  }

  const username = 'admin';
  const plainPassword = 'password'; 
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  console.log('Seeding superadmin user...');

  const superAdmin = await prisma.user.upsert({
    where: { username: username },
    update: {}, // Do nothing if the user already exists
    create: {
      username: username,
      password: hashedPassword,
      email: 'superadmin@example.com',
      firstname: 'Super',
      lastname: 'Admin',
      phone: '+1234567890',
      provider: 'local',
      role: 'ADMIN', 
      status: 'ACTIVE',
    },
  });

  console.log(`Superadmin created/verified successfully:`);
  console.log({
    id: superAdmin.id,
    username: superAdmin.username,
    email: superAdmin.email,
    role: superAdmin.role,
  });

}

main().catch(error => {
    console.error(error);
    process.exit(1);
}).finally( async() => {
    await prisma.$disconnect();
});