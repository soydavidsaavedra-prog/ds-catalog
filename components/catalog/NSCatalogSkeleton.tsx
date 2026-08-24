export function NSCatalogSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="h-3 w-24 rounded bg-surface" />
      <div className="mt-3 h-10 w-64 rounded bg-surface" />
      <div className="mt-8 h-11 w-full max-w-sm rounded-control bg-surface" />
      <div className="mt-5 flex gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 w-28 rounded-control bg-surface" />
        ))}
      </div>
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="aspect-[4/5] rounded-card bg-surface" />
            <div className="h-3 w-3/4 rounded bg-surface" />
            <div className="h-3 w-1/3 rounded bg-surface" />
          </div>
        ))}
      </div>
    </div>
  );
}
