import { z } from "zod";

// All the individual validation rules of each field
//  TODO: validate password fields with String() and trim() ? min1? in zod

export const IdScm = z.coerce.number().int().positive("Invalid ID");

export const LocationIdScm = z.string().uuid("Invalid location ID");

export const GroupIdScm = z.string().trim().uuid("Invalid group ID");

export const NullGroupIdScm = z.string().uuid("Invalid group ID").nullable();

export const PeopleCountScm = z.coerce
  .number()
  .int()
  .positive("Invalid people number")
  .max(30);

export const NameScm = z.string().min(1);

export const DateTimeScm = z.string().datetime();

export const PriceScm = z.coerce.number().positive("Invalid Number");

export const DateScm = z.coerce.date();

export const EmailScm = z.string().email("Invalid email address");

export const PhoneScm = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format");

export const PasswordScm = z
  .string()
  .min(6, "Password must be at least 6 characters long")
  .regex(/[a-zA-Z]/, "Password must contain at least one letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^a-zA-Z0-9]/,
    "Password must contain at least one special character",
  );

export const IdParamSchema = z.object({
  params: z.object({
    id: IdScm,
  }),
});
