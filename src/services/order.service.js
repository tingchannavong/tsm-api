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

export async function createOrder(sessionIds, discount) {
  const sessions = await getSessionsByIds(sessionIds);

  const orderPreview = await getOrderPreviewBySession(sessionIds);

  const { grandTotal, items } = orderPreview;
  const netTotal = grandTotal - discount;

  // create order
  const newOrder = await prisma.order.create({
    data: {
      grandTotal,
      discount,
      netTotal,
    },
  });

  console.log(newOrder);

  items.forEach(async (lineItem) => {
    // create order detail
    const newOrderDetail = await createOrderDetail(newOrder.id, lineItem);
    // update sessions status and orderdetail id at session record
    lineItem.sessionIds.forEach(async (id) => {
      const data = {
        status: "BILLED",
        orderDetailId: newOrderDetail.id,
      };
      const record = await updateSessionById(id, data);
      console.log('session', record);
    });

      console.log('order detail', newOrderDetail)

  });


  return {
    items,
    grandTotal,
    discount,
    netTotal,
  };
}

export async function createOrderDetail(orderId, lineItemData) {
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

  return await prisma.orderDetail.create({
    data: {orderDetails: {
      displayName,
      quantity,
      unitPrice,
      subTotal,
      currencyCode,
      unit,
      durationMin,
      basePrice,
      orderId,
    }}
  });
}
