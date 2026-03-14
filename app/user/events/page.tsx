import UserShell from "@/components/UserShell";

export default async function UserEventsPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/events`, {
    cache: "no-store"
  }).catch(() => null);
  const data = res ? await res.json() : null;

  const events = data?.data ?? [];

  return (
    <UserShell>
      <div id="events" className="tab-pane">
        <div className="card">
          <h1 className="card-title">Events</h1>
          <p className="card-subtitle">
            Discover and join upcoming fitness events tailored to your interests.
          </p>
        </div>

        <div className="card">
          <h2 className="card-title" style={{ fontSize: 20 }}>
            Available Events
          </h2>
          <div className="space-y-2 text-sm text-slate-200">
            {events.length === 0 && <p className="card-subtitle">No events yet.</p>}
            {events.map((e: any) => (
              <div
                key={e.id}
                className="rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-3"
              >
                <p className="font-semibold text-slate-50">{e.title}</p>
                <p className="text-xs text-slate-400">
                  {e.sportType} · {e.location}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </UserShell>
  );
}

