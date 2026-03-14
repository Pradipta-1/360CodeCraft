'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import UserShell from "@/components/UserShell";
import { apiFetch } from "@/lib/apiFetch";

type Trainer = { id: string; name: string | null; email: string };

export default function UserTrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch("/api/trainers")
      .then(res => res.json())
      .then(data => {
        if (data.success) setTrainers(data.data ?? []);
        else setError(data.error ?? "Failed to load trainers");
      })
      .catch(() => setError("Failed to load trainers"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <UserShell>
      <div id="trainers" className="tab-pane">
        <div className="card">
          <h1 className="card-title">Trainers</h1>
          <p className="card-subtitle">
            Browse trainers and start a conversation. Click &quot;Message&quot; to open your inbox
            with that trainer.
          </p>
        </div>
        {error && (
          <div className="card">
            <p className="card-subtitle" style={{ color: '#fecaca' }}>
              {error}
            </p>
          </div>
        )}
        <div className="card">
          {loading ? (
            <p className="card-subtitle">Loading trainers…</p>
          ) : trainers.length === 0 ? (
            <p className="card-subtitle">No trainers found.</p>
          ) : (
            <ul className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-[#0a0a0c]">
              {trainers.map(t => (
                <li
                  key={t.id}
                  className="flex items-center justify-between px-4 py-4 hover:bg-white/5 transition-colors"
                >
                  <div>
                    <p className="font-medium text-white">{t.name ?? "Unnamed"}</p>
                    <p className="text-sm text-slate-400">{t.email}</p>
                  </div>
                  <Link
                    href={`/user/messages?with=${t.id}`}
                    className="rounded-lg bg-[#00c896] px-4 py-2 text-sm font-semibold text-white hover:bg-[#00a87a] transition-colors"
                  >
                    Message
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </UserShell>
  );
}
