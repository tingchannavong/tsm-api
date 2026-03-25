import { z } from 'zod';

// All the individual validation rules of each field
//  TODO: validate password fields with String() and trim() ? min1? in zod

export const IdScm = z.coerce.number().int().positive("Invalid ID");

export const LocationIdScm = z.string().uuid("Invalid Location ID");

export const PeopleCountScm = z.number().int().positive("Invalid people number").max(30);

export const NameScm = z.string().min(1);


