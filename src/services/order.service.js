import prisma from "../libs/prismaClient.js";
import createError from "http-errors";

export async function getOrderPreviewBySession(sessionIds) {

    // session record of each id
  const sessions = await prisma.sessionRecord.findMany({
    where: { id: {
        in: sessionIds
    } },
  });

  // session is an array of session objects
  console.log(sessions);

  // check pricingId is same

  
  
  // return result;
}