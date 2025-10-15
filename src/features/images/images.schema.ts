import { z } from 'zod';

export const imageSchema = z.object({
  path: z.string(),
});

export type PostImage = z.infer<typeof imageSchema>;
