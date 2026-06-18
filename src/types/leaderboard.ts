export type LeaderboardEntry = {
  rank: number;
  userId: string;
  username: string;
  avatarUrl: string | null;
  totalPoints: number;
  isAdmin: boolean;
};

export type LeaderboardResponse = {
  month: string;
  entries: LeaderboardEntry[];
  currentUser: { rank: number; totalPoints: number } | null;
};
