import prisma from "../src/libs/prismaClient.js";

async function main() {
   await prisma.pricing.create({
    data: {
      billingIntervalMin: 1,
      name: "Hourly",
      currencyId: 1,
      unitId: 1,
      roundingMethod: "ROUND_UP",
      price: 1.23
    },
  })
}

main().catch(error => {
    console.error(error);
    process.exit(1);
}).finally( async() => {
    await prisma.$disconnect();
});