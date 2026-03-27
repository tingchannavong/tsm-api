import prisma from "../libs/prismaClient.js";
import createError from "http-errors";
import { getPricingById } from "./pricing.service.js";
import { calculateOrderLineItems, calculateOrderGrandTotal, calculateSessionLineItems } from "../billing/billing.domain.js";

export async function getOrderPreviewBySession(sessionIds) {
  // session records of each id
  const sessions = await getSessionsByIds(sessionIds);

  // FUTURE FEATURE: filter out same pricing
  // get first person's Id
  const pricingId = sessions[0].pricingId;
  const pricingPolicy = await getPricingById(pricingId);
  // console.log("pricing policy", pricingPolicy);

  const sessionItems = calculateSessionLineItems(sessions, pricingPolicy);

  const orderLineItems = calculateOrderLineItems(sessionItems);

  const grandTotal = calculateOrderGrandTotal(orderLineItems);
  const discount = 0;

  const result = {
    items: orderLineItems,
    grandTotal,
    discount: 0,
    netTotal: grandTotal - discount
  };

  return result;
}

export async function getSessionsByIds(sessionIds) {
  const result = await prisma.sessionRecord.findMany({
    where: {
      id: {
        in: sessionIds,
      },
    },
  });
  return result;
}
