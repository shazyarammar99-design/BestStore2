import LeaderboardView from '@/components/leaderboard/LeaderboardView';
import LeaderboardHeader from '@/components/leaderboard/LeaderboardHeader';

export const metadata = {
  title: 'Leaderboard — BEST STORE',
  description: 'Monthly purchase leaderboard — climb the ranks with every order.',
};

export default function LeaderboardPage() {
  return (
    <main className="px-6 pb-24 pt-44">
      <div className="mx-auto max-w-4xl">
        <LeaderboardHeader />
        <LeaderboardView />
      </div>
    </main>
  );
}
