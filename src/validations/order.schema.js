import { z } from 'zod';
import { DateScm, IdScm, LocationIdScm, PeopleCountScm, NullGroupIdScm, NameScm, DateTimeScm, GroupIdScm, PriceScm } from "./base.schema.js";
import { OrderStatus } from '@prisma/client';

export const CreateOrderSchema = z.object({
  body: z.object({
    sessionIds: z.array(z.number()),
    createdById: IdScm.optional(),
  })
});

export const UpdateOrderSchema = z.object({
  params: z.object({
    id: IdScm,
  }),
  body: z.object({
    status: z.nativeEnum(OrderStatus).optional(),
    discount: PriceScm.optional(),
    // updatedById: IdScm
  })
});

export const GetOrdersSchema = z.object({
  query: z.object({
    status: z.nativeEnum(OrderStatus).or(z.literal('all')).optional(),
    page: z.coerce.number().min(1).max(100).default(1),
    limit: z.coerce.number().max(50).default(10),
    id: IdScm.optional(),
    createdById: IdScm.optional(),
    updatedById: IdScm.optional(),
    startDate: DateScm.or(z.literal("")).optional(), 
    endDate: DateScm.or(z.literal("")).optional(),
  })
});