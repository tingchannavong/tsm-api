import { z } from 'zod';
import { IdScm, LocationIdScm, PeopleCountScm, NullGroupIdScm, NameScm, DateTimeScm, GroupIdScm, PriceScm } from "./base.schema.js";
import { OrderStatus } from '@prisma/client';

export const UpdateOrderSchema = z.object({
  params: z.object({
    id: IdScm,
  }),
  body: z.object({
    status: z.nativeEnum(OrderStatus).optional(),
    discount: PriceScm.optional(),
    updatedById: IdScm
  })
});