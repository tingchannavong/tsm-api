import { z } from "zod";
import { IdScm, PasswordScm } from "./base.schema.js";

export const ChangePasswordSchema = z.object({
  params: z.object({
    id: IdScm,
  }),
  body: z
    .object({
      oldPassword: z.string(),
      newPassword:  z.string().min(6, "Password must be at least 6 letters"),
      // newPassword: PasswordScm,
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"], // This points the error to the confirmPassword field
    }),
});

export const ResetPasswordSchema = z.object({
  body: z
    .object({
      newPassword:  z.string().min(6, "Password must be at least 6 letters"),
      // newPassword: PasswordScm,
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
});

export const RegisterSchema = z.object({
  body: z
    .object({
      username: z
        .string("Not a string")
        .min(3, "Minimum username is 3 letters"),
      firstname: z.string().min(1, "Firstname must have atleast 1 letter"),
      lastname: z.string().min(1, "Lastname must have atleast 1 letter"),
      phone: z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
      email: z.string().email("Invalid email address"),
      password: z.string().min(6, "Password must be at least 6 letters"),
    })
});
