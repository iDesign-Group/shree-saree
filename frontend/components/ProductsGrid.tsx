import Image from 'next/image';
import { apiFetch } from '@/lib/api';

const API_HOST = process.env.NEXT_PUBLIC_API_BASE?.replace('/api', '') ?? 'http://localhost:5000';

/** Normalise whatever multer stored (e.g. "uploads\\file.jpg", "uploads/file.jpg",
 *  "api/uploads/file.jpg") into a clean absolute URL. */
function buildImageUrl(imagePath: string): string {
  // Replace Windows backslashes
  const normalized = imagePath.replace(/\\/g, '/');
  // Strip any leading api/ or duplicate uploads/
  const clean = normalized.replace(/^(api\/)?/, '');
  // Remove leading slash if present
  const trimmed = clean.replace(/^\//, '');
  // If path already starts with uploads/, use as-is; else prepend uploads/
  const finalPath = trimmed.startsWith('uploads/') ? trimmed : `uploads/${trimmed}`;
  return `${API_HOST}/${finalPath}`;
}

type Product = {
  id: number;
  product_code: string;
  name: string;
  price_per_saree: number | string;
  sarees_per_bundle?: number | string;
  bundle_price?: number | string;
  primary_image?: string | null;
  category_name?: string;
  brand_name?: string;
};

type ProductsResponse = { success: boolean; data: Product[] };

type Props = {
  search?: string;
  category_id?: string;
  page?: number;
};

const LIMIT = 20;

export default async function ProductsGrid({ search = '', category_id = '', page = 1 }: Props) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (category_id) params.set('category_id', category_id);
  params.set('page', String(page));
  params.set('limit', String(LIMIT));

  let products: Product[] = [];
  let error = '';

  try {
    const res = await apiFetch<ProductsResponse>(`/products?${params.toString()}`);
    products = res.success ? res.data : [];
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : 'Failed to load products.';
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
        ⚠️ {error}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
        <p className="text-sm text-slate-500">No products found.</p>
        {search && (
          <p className="mt-1 text-xs text-slate-400">Try a different search term.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">{products.length} product{products.length !== 1 ? 's' : ''} found</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => {
          const pricePerSaree = parseFloat(String(p.price_per_saree));
          const bundlePrice = p.bundle_price ? parseFloat(String(p.bundle_price)) : null;
          const sareesPerBundle = p.sarees_per_bundle ? parseInt(String(p.sarees_per_bundle)) : null;
          const imageUrl = p.primary_image ? buildImageUrl(p.primary_image) : null;

          return (
            <article
              key={p.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="relative h-44 w-full bg-slate-100">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={p.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-300 text-xs">No Image</div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col gap-1 p-3 text-sm">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-medium text-slate-400">{p.product_code}</span>
                  {p.category_name && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                      {p.category_name}
                    </span>
                  )}
                </div>

                <div className="line-clamp-2 font-semibold text-slate-900">{p.name}</div>

                {p.brand_name && (
                  <div className="text-xs text-slate-400">{p.brand_name}</div>
                )}

                <div className="mt-auto flex items-baseline justify-between pt-2 text-xs">
                  <span className="font-semibold text-slate-800">
                    ₹{isNaN(pricePerSaree) ? '—' : pricePerSaree.toFixed(2)} / saree
                  </span>
                  {sareesPerBundle && bundlePrice ? (
                    <span className="text-slate-500">
                      {sareesPerBundle} pcs • ₹{bundlePrice.toFixed(2)}
                    </span>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Pagination */}
      {products.length === LIMIT && (
        <div className="flex justify-center gap-3 pt-2">
          {page > 1 && (
            <a
              href={`/dashboard/products?search=${search}&category_id=${category_id}&page=${page - 1}`}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
            >
              ← Prev
            </a>
          )}
          <span className="rounded-md border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
            Page {page}
          </span>
          <a
            href={`/dashboard/products?search=${search}&category_id=${category_id}&page=${page + 1}`}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
          >
            Next →
          </a>
        </div>
      )}
    </div>
  );
}
