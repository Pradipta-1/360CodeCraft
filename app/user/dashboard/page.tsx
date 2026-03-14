export default function UserDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <h1 className="text-xl font-semibold text-slate-50">User Dashboard</h1>
        <p className="text-sm text-slate-400">
          Recommended events, featured trainers, joined events, and community activity will appear
          here.
        </p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
        <img src="/fitnes.png" alt="Community hero" className="h-56 w-full object-cover" />
      </div>
    </div>
  );
}

