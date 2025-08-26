import { z } from 'zod';

// SQLite uses file: URLs; Postgres will be a real URL
const DbUrl = z
  .string()
  .min(1, 'DATABASE_URL is required')
  .refine((v) => v.startsWith('file:') || /^postgres(?:ql)?:\/\//.test(v), {
    message: 'DATABASE_URL must be "file:..." (dev) or a Postgres URL',
  });

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: DbUrl,
  NEXT_PUBLIC_APP_NAME: z.string().default('ReceiptRadar'),
});

export const env = schema.parse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
});
