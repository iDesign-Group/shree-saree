import Image from 'next/image';
import { apiFetch } from '@/lib/api';

type Product = {
  id: number;
  product_code: string;
  name: string;
  price_per_saree: number;
  sarees_per_bundle?: number;
  bundle_price?: number;
  primary_image?: string | null;
};

type ProductsResponse = { success: boolean; data: Product[] };

export default async function ProductsPage() {
  const res = await apiFetch<ProductsResponse>('/products?limit=100');
  const products = res.success ? res.data : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Products</h2>
        {/* later: filters/search */}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => (
          <article
            key={p.id}
            className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="relative h-40 w-full bg-slate-100">
              {p.primary_image ? (
                <Image
                  src={`http://localhost:5000/${p.primary_image}`}
                  alt={p.name}
                  fill
                  className="object-cover"
                />
              ) : null}
            </div>
            <div className="flex flex-1 flex-col gap-1 p-3 text-sm">
              <div className="text-xs font-medium text-slate-500">
                {p.product_code}
              </div>
              <div className="line-clamp-2 font-semibold text-slate-900">
                {p.name}
              </div>
              <div className="mt-auto flex items-baseline justify-between pt-2 text-xs text-slate-600">
                <span>₹{p.price_per_saree.toFixed(2)} / saree</span>
                {p.sarees_per_bundle && p.bundle_price ? (
                  <span>
                    {p.sarees_per_bundle} pcs • ₹
                    {p.bundle_price.toFixed(2)}
                  </span>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
