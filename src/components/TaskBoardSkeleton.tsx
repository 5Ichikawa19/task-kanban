export function TaskBoardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <p className="sr-only">読み込み中…</p>
      <div aria-hidden="true" className="h-56 animate-pulse rounded-xl bg-muted" />
      <div aria-hidden="true" className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <div key={index} className="h-48 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
