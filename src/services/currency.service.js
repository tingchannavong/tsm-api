import prisma from "../libs/prismaClient.js";
import createError from "http-errors";

// export async function getCurrencyCodeByPricingId(pricingId) {
//   const result = await prisma.currency.findUnique({
//     where: { pricings: {
//         id: pricingId
//     }},
//     select: {
//         code: true
//     }
//   });

//   return result;
// }
