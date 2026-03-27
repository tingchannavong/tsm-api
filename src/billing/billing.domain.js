import { convertDateTimeTo24HrTime, convertMinToHour } from "../utils/time.js";

export function calculateTotalPrice(unit, price) {
  const total = unit * price;
  return Number(total.toFixed(2));
}

export function calculateSessionLineItems(sessions, pricingPolicy) {
  const items = [];

  sessions.forEach((session) => {
    const line = {};
    line.sessionId = session.id;
    line.pricingPolicy = pricingPolicy.name;
    line.startTime = session.startTime;
    line.endTime = session.endTime;
    line.durationMin = session.durationMin;
    line.price = pricingPolicy.price;
    line.lineTotal = calculateTotalPrice(line.durationMin, line.price);
    line.currencyCode = pricingPolicy.currency.code;
    line.unit = pricingPolicy.unit.name;
    line.basePrice = pricingPolicy.price;
    items.push(line);
  });

  return items;
}

// line aggregate by same duration logic, add quantity field, subtotal calc
export function calculatePreviewOrderLineItems(sessionItems) {
  const timeGroup = sessionItems.reduce((prev, cur) => {
    const startTime = convertDateTimeTo24HrTime(cur.startTime);
    if (!prev[`${cur.durationMin}-${startTime}`]) {
      prev[`${cur.durationMin}-${startTime}`] = [cur];
    } else {
      prev[`${cur.durationMin}-${startTime}`].push(cur);
    }
    return prev;
  }, {});

  const orderItems = [];

  Object.keys(timeGroup).forEach((key) => {
    const line = {};
    const startTime = convertDateTimeTo24HrTime(timeGroup[key][0].startTime);
    const endTime = convertDateTimeTo24HrTime(timeGroup[key][0].endTime);
    line.displayName = `${timeGroup[key][0].pricingPolicy} ${startTime} - ${endTime}`;
    line.totalHrs = convertMinToHour(timeGroup[key][0].durationMin);
    line.quantity = timeGroup[key].length;
    line.unitPrice = timeGroup[key][0].lineTotal;
    line.subTotal = calculateTotalPrice(line.quantity, line.unitPrice);
    line.currencyCode = timeGroup[key][0].currencyCode;
    line.unit = timeGroup[key][0].unit;
    line.durationMin = timeGroup[key][0].durationMin;
    line.basePrice = timeGroup[key][0].basePrice;
    line.sessionIds = timeGroup[key].map( session => session.sessionId );

    orderItems.push(line);
  });
  return orderItems;
}

export function calculateOrderGrandTotal(orderLineItems) {
  let total = 0;
  orderLineItems.forEach((line) => (total += line.subTotal));
  return Number(total.toFixed(2));
}