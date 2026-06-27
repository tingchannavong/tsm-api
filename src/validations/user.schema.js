import { z } from "zod";
import { EmailScm, IdScm, NameScm, PasswordScm, PhoneScm } from "./base.schema.js";

export const UpdateUserSchema = z.object({
  params: z.object({
    id: IdScm,
  }),
  body: z.object({
   username: NameScm.optional(), 
//    password: PasswordScm.optional(), 
   email: EmailScm.optional(), 
   firstname: NameScm.optional(), 
    lastname: NameScm.optional(), 
    phone: PhoneScm.optional()
  })
});