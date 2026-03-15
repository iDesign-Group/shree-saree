export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">Login</h1>
        <p className="mt-1 text-sm text-slate-600">
          Use your registered mobile / credentials.
        </p>
        {/* Form logic will come later */}
        <form className="mt-6 space-y-4">
          <div className="space-y-1 text-sm">
            <label className="block font-medium text-slate-700">
              Mobile number
            </label>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              type="text"
              autoComplete="tel"
            />
          </div>
          <div className="space-y-1 text-sm">
            <label className="block font-medium text-slate-700">
              Password / OTP
            </label>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              type="password"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow hover:bg-slate-800"
          >
            Login
          </button>
        </form>
      </div>
    </main>
  );
}
