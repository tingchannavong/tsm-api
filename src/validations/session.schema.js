import { z } from 'zod';
import { SessionStatus } from '@prisma/client';
import { IdScm, LocationIdScm, PeopleCountScm, NullGroupIdScm, NameScm, DateTimeScm, GroupIdScm } from "./base.schema.js";

export const idSchema = z.object({
  params: z.object({
    id: IdScm,
  }),
});

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
    locationId: LocationIdScm.optional(),
    groupId: NullGroupIdScm.optional(),
    status: z.nativeEnum(SessionStatus).optional(),
  })
});

export const UpdateSessionSchema = z.object({
  params: z.object({
    id: IdScm,
  }),
  body: z.object({
    status: z.nativeEnum(SessionStatus).optional(),
    name: NameScm.optional(),
    endTime: DateTimeScm.optional(),
    startTime: DateTimeScm.optional()
  })
});

export const UpdateGroupSessionSchema = z.object({
  params: z.object({
    id: GroupIdScm,
  }),
  body: z.object({
    status: z.nativeEnum(SessionStatus),
    endTime: DateTimeScm
  })
});