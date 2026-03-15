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
        <div className="mt-8">
          <Link
            href="/login"
            style={{
              display: 'inline-block',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              padding: '16px 48px',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '600',
              textDecoration: 'none',
              marginTop: '24px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
            }}
          >
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}
