export default function DashboardLoading() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl bg-slate-200/70"
          />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-slate-200/70" />
    </div>
  );
}
