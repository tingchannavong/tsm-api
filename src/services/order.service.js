import prisma from "../libs/prismaClient.js";
import createError from "http-errors";
import { getPricingById } from "./pricing.service.js";
import {
  calculateOrderGrandTotal,
  calculateSessionLineItems,
  calculatePreviewOrderLineItems,
} from "../billing/billing.domain.js";
import { endGroupSessions, getSessionsByFilter, updateSessionById, validateBilledSession } from "./session.service.js";

export async function getOrderPreviewBySession(payload) {
    const { sessionIds, endTime } = payload;

  // session records of each id
  const sessions = await getSessionsByIds(sessionIds);

  if (sessions.length === 0) throw createError(404, "No sessions found");

  // FUTURE FEATURE: filter out same pricing // console.log("pricing policy", pricingPolicy);
  // get first person's Id
  const pricingId = sessions[0].pricingId;
  const pricingPolicy = await getPricingById(pricingId);

  const sessionItems = calculateSessionLineItems(sessions, pricingPolicy, {endTime});
  // console.log(sessionItems);
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
  const { sessionIds, discount = 0, createdById } = payload;

  try {
    await validateBilledSession(sessionIds);

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
            connect: { id: createdById },
          },
        },
      });
      console.log('newOrder', newOrder);
      console.log('items', items);

      for (const lineItem of items) {
        const newOrderDetail = await createOrderDetail(newOrder.id, lineItem, tx);
        // update sessionRecord to BILLED
        const updatedSessions = await endGroupSessions("id", {in: lineItem.sessionIds}, {status: "BILLED"}, tx);
        console.log("updated sessions", updatedSessions);
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

export async function getAllOrdersWithDetails(query) {
  const { status, createdById, updatedById } = query;

  const filters = {};
  if (status) filters.status = status;
  if (createdById) filters.createdById = createdById;
  if (updatedById) filters.updatedById = updatedById;

  const result = await prisma.order.findMany({
    where: filters,
    include: {
      orderDetails: true,
    },
  });

  return result;
}

export async function getOrderById(id) {
  const result = await prisma.order.findUnique({
    where: { id },
    include: {
      orderDetails: true,
    },
  });

  if (result === null) throw createError(404, "Order not found")

  return result;
}

export async function updateOrderById(id, payload) {

   const { status, updatedById } = payload;

   // if you wanna patch discount, you gotta recalc get(grandTotal) - discount = netTotal (update both discount and netTotal)

  const data = {};
  if (status) data.status = status;
  if (updatedById) data.updatedById = updatedById;

   const result = await prisma.order.update({
    where: {id},
    data
  });

  return result;
}

export async function deleteOrderById(id, role) {
  // CHECK IF ADMIN CAN DELETE
  if (role !== 'ADMIN') throw createError(403, `No permission to delete`); 

  const result = await prisma.order.delete({
    where: {id}
  });

  return result;
}
