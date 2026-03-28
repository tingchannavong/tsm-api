import { z } from 'zod';

// All the individual validation rules of each field
//  TODO: validate password fields with String() and trim() ? min1? in zod

export const IdScm = z.coerce.number().int().positive("Invalid ID");

export const LocationIdScm = z.string().uuid("Invalid location ID");

export const GroupIdScm = z.string().trim().uuid("Invalid group ID");

export const NullGroupIdScm = z.string().uuid("Invalid group ID").nullable();

export const PeopleCountScm = z.number().int().positive("Invalid people number").max(30);

export const NameScm = z.string().min(1);

export const DateTimeScm = z.string().datetime();

export const PriceScm = z.coerce.number().positive("Invalid Number");