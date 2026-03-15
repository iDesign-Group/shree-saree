import { apiFetch } from '@/lib/api';

type ProductsCountResponse = { success: boolean; total: number };
type OrdersResponse = { success: boolean; data: any[] };

async function getStats() {
  const [prodCount, orders] = await Promise.all([
    apiFetch<ProductsCountResponse>('/products/count'),
    apiFetch<OrdersResponse>('/orders?limit=100'),
  ]);

  const totalOrders = orders.success ? orders.data.length : 0;
  const pendingOrders = orders.success
    ? orders.data.filter((o) => o.order_status === 'placed').length
    : 0;
  const shippedOrders = orders.success
    ? orders.data.filter((o) => o.order_status === 'shipped').length
    : 0;

  return {
    totalProducts: prodCount.success ? prodCount.total : 0,
    totalOrders,
    pendingOrders,
    shippedOrders,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: 'Total Products', value: stats.totalProducts },
    { label: 'Total Orders', value: stats.totalOrders },
    { label: 'Pending Orders', value: stats.pendingOrders },
    { label: 'Shipped Orders', value: stats.shippedOrders },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {card.label}
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {card.value}
            </div>
          </div>
        ))}
      </section>

      {/* Later: recent orders list */}
    </div>
  );
}
