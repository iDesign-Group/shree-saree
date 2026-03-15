'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <div className="font-semibold">Something went wrong.</div>
      <p className="mt-1">
        {error.message || 'Unable to load dashboard.'}
      </p>
      <button
        onClick={reset}
        className="mt-3 inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  );
}
