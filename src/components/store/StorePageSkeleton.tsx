export default function StorePageSkeleton({ variant }: { variant: 'category' | 'product' }) {
  return (
    <main className="px-6 pb-24 pt-32">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="border-b border-best-border pb-8">
          <div className="h-3 w-40 rounded bg-best-border" />
          <div className="mt-4 h-10 w-64 max-w-full rounded bg-best-border" />
          {variant === 'category' && <div className="mt-3 h-4 w-96 max-w-full rounded bg-best-border/70" />}
        </div>

        {variant === 'category' ? (
          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
            <div className="hidden h-72 rounded-xl bg-best-elevated lg:block" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-72 rounded-xl bg-best-elevated" />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-2">
            <div className="aspect-square rounded-xl bg-best-elevated" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 rounded bg-best-border" />
              <div className="h-4 w-full rounded bg-best-border/70" />
              <div className="h-4 w-5/6 rounded bg-best-border/70" />
              <div className="mt-6 h-12 w-40 rounded-lg bg-best-border" />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
