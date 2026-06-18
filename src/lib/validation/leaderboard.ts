import { z } from 'zod';

export const leaderboardQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(50),
});

export type LeaderboardQuery = z.infer<typeof leaderboardQuerySchema>;
