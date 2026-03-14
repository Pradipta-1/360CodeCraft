import OrganizerShell from "@/components/OrganizerShell";

export default async function OrganizerManageEventsPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/events?status=PENDING`, {
    cache: "no-store"
  }).catch(() => null);
  const data = res ? await res.json() : null;
  const events = data?.data ?? [];

  return (
    <OrganizerShell>
      <div id="manage-events" className="tab-pane active">
        <div className="card" style={{ marginBottom: 0 }}>
          <h1 className="card-title">Manage Events</h1>
          <p className="card-subtitle">
            Your created events and their approval status will appear here.
          </p>
        </div>
        <div className="card">
          <div className="space-y-4 text-sm text-slate-300">
            {events.length === 0 && <p className="card-subtitle">No events to manage yet.</p>}
            {events.map((e: any) => (
              <div
                key={e.id}
                className="rounded-xl border border-slate-800 bg-[#0a0a0c] px-4 py-4 hover:border-[#00c896]/30 transition-colors"
              >
                <p className="text-lg font-semibold text-white">{e.title}</p>
                <p className="text-sm text-slate-400 mt-1 mb-2">
                  {e.sportType} · {e.location}
                </p>
                <span className="inline-block rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400 border border-yellow-500/20">
                  Status: {e.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </OrganizerShell>
  );
}
