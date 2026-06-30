import { z } from 'zod';
import { IdScm, PasswordScm } from './base.schema.js';

export const ChangePasswordSchema = z.object({
    params: z.object({
    id: IdScm,
  }),
  body: z.object({
    oldPassword: z.string(),
    newPassword: z.string(6),
    // newPassword: PasswordScm,
    confirmPassword: z.string()
  }).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"], // This points the error to the confirmPassword field
})
});

export const ResetPasswordSchema = z.object({
  body: z.object({
    newPassword: z.string(6),
    // newPassword: PasswordScm,
    confirmPassword: z.string()
  }).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"], // This points the error to the confirmPassword field
})
});
