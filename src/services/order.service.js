import prisma from "../libs/prismaClient.js";
import createError from "http-errors";
import { getPricingById } from "./pricing.service.js";
import { calculateTotalPrice } from "../billing/billing.domain.js";

export async function getOrderPreviewBySession(sessionIds) {
  // session records of each id
  const sessions = await getSessionsByIds(sessionIds);

  // session is an array of session objects
  console.log("sessions", sessions);

  // get first person's Id
  const pricingId = sessions[0].pricingId;
  const pricingPolicy = await getPricingById(pricingId);

  console.log("pricing policy", pricingPolicy);

  // FUTURE: filter out same pricing

  const items = [];
  // line item calcs
  sessions.forEach((session) => {
    const lineItem = {};
    lineItem.sessionId = session.id;
    lineItem.startTime = session.startTime;
    lineItem.endTime = session.endTime;
    lineItem.durationMin = session.durationMin;
    lineItem.price = pricingPolicy.price;
    lineItem.lineTotal = calculateTotalPrice(lineItem.durationMin, lineItem.price);

    items.push(lineItem);
  });

  const result = {};
// TO DO line aggregate logic 
//   {
//   "items": [
//     {
//       "type": "SESSION_TIME"
//       "name": "Board game time (86 min)",
//       "quantity": 2,
// START TIME
// END TIME
// DURATION in mins
//       "unitPrice": 105.78,
//       "lineTotal": 211.56
//     },
//     {
//    
//       "name": "Coke",
//       "quantity": 3,
//       "unitPrice": 25,
//       "lineTotal": 75
//     }
//   ],
//   "subtotal": 286.56,
// "discount": 0,
//   "total": 286.56
// }

  return items;
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
