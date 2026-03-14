"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Trainer = { id: string; name: string | null };

export default function UserTrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/trainers", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.success) setTrainers(data.data ?? []);
        else setError(data.error ?? "Failed to load trainers");
      })
      .catch(() => setError("Failed to load trainers"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-50">Trainers</h1>
      <p className="text-sm text-slate-400">
        Browse trainers and start a conversation. Click &quot;Message&quot; to open your inbox with that trainer.
      </p>
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      {loading ? (
        <p className="text-sm text-slate-400">Loading trainers…</p>
      ) : trainers.length === 0 ? (
        <p className="text-sm text-slate-400">No trainers found.</p>
      ) : (
        <ul className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-900/50">
          {trainers.map(t => (
            <li
              key={t.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <span className="font-medium text-slate-50">{t.name ?? "Unnamed"}</span>
              <Link
                href={`/user/messages?with=${t.id}`}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-slate-50 hover:bg-emerald-500"
              >
                Message
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
