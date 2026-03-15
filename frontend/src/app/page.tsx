import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-slate-100">
      <div className="px-4 text-center">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
          Shree Saree
        </h1>
        <p className="mt-3 text-slate-600">
          Wholesale saree ordering platform. Login to view products, place orders, and track shipments.
        </p>
        <div className="mt-6">
          <Link
            href="/login"
            className="inline-flex items-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow hover:bg-slate-800"
          >
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}
