import { z } from 'zod';
import { SessionStatus } from '@prisma/client';
import { IdScm, LocationIdScm, PeopleCountScm, NullGroupIdScm, NameScm, DateTimeScm, GroupIdScm, DateScm } from "./base.schema.js";

export const GetLocationSchema = z.object({
  query: z.object({
    locationId: LocationIdScm
  }),
});

// TO DO: refactor names z.array string().min(1)
export const CreateSessionSchema = z.object({
  body: z.object({
    locationId: LocationIdScm,
    groupId: NullGroupIdScm,
    people: PeopleCountScm,
    pricingId: IdScm.optional(),
  })
});

export const GetSessionsSchema = z.object({
  query: z.object({
    locationId: LocationIdScm.or(z.literal('all')).optional(),
    groupId: NullGroupIdScm.optional(),
    status: z.nativeEnum(SessionStatus).or(z.literal('all')).optional(),
    page: z.coerce.number().min(1).max(100).default(1),
    limit: z.coerce.number().max(50).default(20),
    startDate: DateScm.or(z.literal("")).optional(),
    endDate: DateScm.or(z.literal("")).optional(),
    name: z.string().optional()
  })
});

export const UpdateSessionSchema = z.object({
  params: z.object({
    id: IdScm,
  }),
  body: z.object({
    status: z.nativeEnum(SessionStatus).optional(),
    name: NameScm.optional(),
    // endTime: DateTimeScm.optional(),
    // startTime: DateTimeScm.optional()
  })
});

export const UpdateGroupSessionSchema = z.object({
  params: z.object({
    id: GroupIdScm,
  }),
  body: z.object({
    status: z.nativeEnum(SessionStatus),
    // endTime: DateTimeScm
  })
});