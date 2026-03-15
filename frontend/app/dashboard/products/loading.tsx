export default function ProductsLoading() {
  return (
    <div className="space-y-5">
      <div className="h-7 w-32 animate-pulse rounded bg-slate-200" />
      <div className="flex gap-3">
        <div className="h-9 w-64 animate-pulse rounded-md bg-slate-200" />
        <div className="h-9 w-36 animate-pulse rounded-md bg-slate-200" />
        <div className="h-9 w-20 animate-pulse rounded-md bg-slate-200" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-slate-200 bg-white">
            <div className="h-44 w-full rounded-t-xl bg-slate-200" />
            <div className="space-y-2 p-3">
              <div className="h-3 w-1/3 rounded bg-slate-200" />
              <div className="h-4 w-3/4 rounded bg-slate-200" />
              <div className="h-3 w-1/2 rounded bg-slate-200" />
              <div className="h-3 w-2/3 rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
