import { z } from "zod";
import bcrypt from "bcryptjs";

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.enum(["admin", "editor"]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateUser = z.infer<typeof CreateUserSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type Login = z.infer<typeof LoginSchema>;

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePasswords = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
}; 