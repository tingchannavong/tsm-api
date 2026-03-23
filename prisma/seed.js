import prisma from "../src/libs/prismaClient.js";
async function main() {
    // await prisma.$executeRaw`TRUNCATE TABLE User`
}

main().catch(error => {
    console.error(error);
    process.exit(1);
}).finally( async() => {
    await prisma.$disconnect();
});