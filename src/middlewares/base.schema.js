import { z } from 'zod';

export const IdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("Invalid ID"),
  }),
});