export default async function OrganizerManageEventsPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/events?status=PENDING`, {
    cache: "no-store"
  }).catch(() => null);
  const data = res ? await res.json() : null;
  const events = data?.data ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-50">Manage Events</h1>
      <p className="text-sm text-slate-400">
        Your created events and their approval status will appear here.
      </p>
      <div className="space-y-2 text-sm text-slate-300">
        {events.length === 0 && <p>No events to manage yet.</p>}
        {events.map((e: any) => (
          <div
            key={e.id}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2"
          >
            <p className="font-semibold text-slate-50">{e.title}</p>
            <p className="text-xs text-slate-400">
              {e.sportType} · {e.location}
            </p>
            <p className="text-xs text-yellow-400">Status: {e.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

