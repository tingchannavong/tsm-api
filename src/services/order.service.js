import prisma from "../libs/prismaClient.js";
import createError from "http-errors";
import { getPricingById } from "./pricing.service.js";
import {
  calculateOrderGrandTotal,
  calculateSessionLineItems,
  calculatePreviewOrderLineItems,
} from "../billing/billing.domain.js";
import { updateSessionById } from "./session.service.js";

export async function getOrderPreviewBySession(sessionIds) {
  // session records of each id
  const sessions = await getSessionsByIds(sessionIds);

  // FUTURE FEATURE: filter out same pricing // console.log("pricing policy", pricingPolicy);
  // get first person's Id
  const pricingId = sessions[0].pricingId;
  const pricingPolicy = await getPricingById(pricingId);

  const sessionItems = calculateSessionLineItems(sessions, pricingPolicy);
  console.log(sessionItems);
  const orderLineItems = calculatePreviewOrderLineItems(sessionItems);

  const grandTotal = calculateOrderGrandTotal(orderLineItems);
  const discount = 0;

  const result = {
    items: orderLineItems,
    grandTotal,
    discount: 0,
    netTotal: grandTotal - discount,
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

export async function createOrder(payload) {

  const { sessionIds, discount, createdById } = payload;

  try {
    const orderPreview = await getOrderPreviewBySession(sessionIds);

    const { grandTotal, items } = orderPreview;
    const netTotal = grandTotal - discount;

    const result = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          grandTotal,
          discount,
          netTotal,
          createdBy: {
            connect: {createdById}
          }
        },
      });
      console.log(newOrder);
      for (const lineItem of items) {
        const newOrderDetail = await createOrderDetail(newOrder.id, lineItem, tx);
        console.log("order detail", newOrderDetail);
      }
      return newOrder;
    });

    return {
      orderId: result.id,
      items,
      grandTotal,
      discount,
      netTotal,
    };
  } catch (error) {
    console.log(error);
    throw createError(400, `Order creation failed: ${error.message}`);
  }
}

export async function createOrderDetail(orderId, lineItemData, tx) {
  const db = tx || prisma;
  const {
    displayName,
    quantity,
    unitPrice,
    subTotal,
    currencyCode,
    unit,
    durationMin,
    basePrice,
  } = lineItemData;

  return await db.orderDetail.create({
    data: {
      displayName,
      quantity,
      unitPrice,
      subTotal,
      currencyCode,
      unit,
      durationMin,
      basePrice,
      orderId,
      sessions: {
        connect: lineItemData.sessionIds.map((id) => ({ id })),
      },
    },
  });
}

// GET ORDER WITH ORDER DETAILS QUERY?