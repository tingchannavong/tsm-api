import prisma from "../libs/prismaClient.js";
import createError from "http-errors";

// export async function getUnitNameByPricingId(pricingId) {
//   const result = await prisma.unit.findUnique({
//     where: { id },
//   });

//   return result;
// }