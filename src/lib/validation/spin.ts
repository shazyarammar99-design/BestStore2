import { z } from 'zod';

export const spinRequestSchema = z.object({
  challengeId: z.string().min(8).max(64),
  answer: z.coerce.number().int(),
  captchaToken: z.string().min(16),
});

export type SpinRequest = z.infer<typeof spinRequestSchema>;
