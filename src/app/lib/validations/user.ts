// src/app/lib/validations/user.ts
import { z } from 'zod';

export const userCreateSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(50),
  password: z.string().min(6),
  role: z.enum(['USER', 'ADMIN']),
});