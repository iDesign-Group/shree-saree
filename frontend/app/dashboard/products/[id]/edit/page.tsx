import { apiFetch } from '@/lib/api';
import EditProductForm from '@/components/EditProductForm';
import { notFound } from 'next/navigation';

type Product = {
  id: number;
  product_code: string;
  name: string;
  price_per_saree: number | string;
  sarees_per_bundle?: number | string;
  bundle_price?: number | string;
  fabric?: string;
  occasion?: string;
  description?: string;
  category_name?: string;
  brand_name?: string;
};

type ProductResponse = { success: boolean; data: Product };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let product: Product | null = null;

  try {
    const res = await apiFetch<ProductResponse>(`/products/${id}`);
    product = res.success ? res.data : null;
  } catch {
    product = null;
  }

  if (!product) return notFound();

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Edit Product</h2>
        <p className="text-sm text-slate-500">
          Editing: <span className="font-medium text-slate-700">{product.name}</span>
        </p>
      </div>
      <EditProductForm product={product} />
    </div>
  );
}
