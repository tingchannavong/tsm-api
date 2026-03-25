import { z } from 'zod';
import { IdScm, LocationIdScm, PeopleCountScm, NameScm } from "./base.schema.js";

export const GetSessionSchema = z.object({
  params: z.object({
    id: IdScm,
  }),
});

export const CreateSessionSchema = z.object({
  body: z.object({
    id: IdScm,
    locationId: LocationIdScm,
    people: PeopleCountScm,
    name1: NameScm
  }),
});