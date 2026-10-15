function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-card">
      <div className="skeleton aspect-[4/3]" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-5 w-3/4 rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="skeleton h-4 w-1/3 rounded" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="bg-brand-900 py-12"><div className="container"><div className="skeleton h-9 w-64 rounded !bg-white/15" /></div></div>
      <div className="container grid gap-5 py-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    </div>
  );
}
