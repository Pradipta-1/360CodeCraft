export default function TrainerDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <h1 className="text-xl font-semibold text-slate-50">Trainer Dashboard</h1>
        <p className="text-sm text-slate-400">
          Invitations, upcoming confirmed events, and earnings summary will appear here.
        </p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
        <img src="/fitnessss.png" alt="Trainer hero" className="h-56 w-full object-cover" />
      </div>
    </div>
  );
}

