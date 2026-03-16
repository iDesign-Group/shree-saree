'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';

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
};

export default function EditProductForm({ product }: { product: Product }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: product.name || '',
    product_code: product.product_code || '',
    price_per_saree: String(product.price_per_saree || ''),
    sarees_per_bundle: String(product.sarees_per_bundle || ''),
    fabric: product.fabric || '',
    occasion: product.occasion || '',
    description: product.description || '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:5000/api'}/products/${product.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            name: form.name,
            product_code: form.product_code,
            price_per_saree: parseFloat(form.price_per_saree),
            sarees_per_bundle: parseInt(form.sarees_per_bundle),
            fabric: form.fabric,
            occasion: form.occasion,
            description: form.description,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to update product.');
        return;
      }

      setSuccess('Product updated successfully!');
      setTimeout(() => router.push('/dashboard/products'), 1200);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

      {success && (
        <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          ✅ {success}
        </div>
      )}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Product Name */}
        <div className="sm:col-span-2 space-y-1">
          <label className="block text-sm font-medium text-slate-700">Product Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        {/* Product Code */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Product Code</label>
          <input
            name="product_code"
            value={form.product_code}
            onChange={handleChange}
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        {/* Price per Saree */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Price per Saree (₹)</label>
          <input
            name="price_per_saree"
            type="number"
            step="0.01"
            value={form.price_per_saree}
            onChange={handleChange}
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        {/* Sarees per Bundle */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Sarees per Bundle</label>
          <input
            name="sarees_per_bundle"
            type="number"
            value={form.sarees_per_bundle}
            onChange={handleChange}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        {/* Fabric */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Fabric</label>
          <input
            name="fabric"
            value={form.fabric}
            onChange={handleChange}
            placeholder="e.g. Cotton, Silk"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        {/* Occasion */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Occasion</label>
          <input
            name="occasion"
            value={form.occasion}
            onChange={handleChange}
            placeholder="e.g. Daily, Festive"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        {/* Description */}
        <div className="sm:col-span-2 space-y-1">
          <label className="block text-sm font-medium text-slate-700">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard/products')}
          className="rounded-md border border-slate-300 px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
