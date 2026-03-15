import { Suspense } from 'react';
import Image from 'next/image';
import { apiFetch } from '@/lib/api';
import ProductsGrid from '@/components/ProductsGrid';

type SearchParams = {
  search?: string;
  category_id?: string;
  page?: string;
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const search = searchParams.search || '';
  const category_id = searchParams.category_id || '';
  const page = parseInt(searchParams.page || '1');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Products</h2>
          <p className="text-sm text-slate-500">Manage your saree catalogue</p>
        </div>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search by name or code..."
          className="w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
        />
        <select
          name="category_id"
          defaultValue={category_id}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
        >
          <option value="">All Categories</option>
        </select>
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
        >
          Search
        </button>
        {(search || category_id) && (
          <a
            href="/dashboard/products"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Clear
          </a>
        )}
      </form>

      {/* Products Grid */}
      <Suspense fallback={<ProductsSkeleton />}>
        <ProductsGrid search={search} category_id={category_id} page={page} />
      </Suspense>
    </div>
  );
}

function ProductsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border border-slate-200 bg-white">
          <div className="h-40 w-full rounded-t-xl bg-slate-200" />
          <div className="space-y-2 p-3">
            <div className="h-3 w-1/3 rounded bg-slate-200" />
            <div className="h-4 w-3/4 rounded bg-slate-200" />
            <div className="h-3 w-1/2 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
