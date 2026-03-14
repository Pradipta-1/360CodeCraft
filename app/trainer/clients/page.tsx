"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Thread = {
  partner: { id: string; name: string | null; role: string } | null;
  lastMessage: string;
  updatedAt: string;
};

export default function TrainerClientsPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/messages/threads", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          const clientThreads = data.data.filter(
            (t: Thread) => t.partner?.role === "USER"
          );
          setThreads(clientThreads);
        } else {
          setError(data.error ?? "Failed to load clients");
        }
      })
      .catch(() => setError("Failed to load clients"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-50">Clients</h1>
      <p className="text-sm text-slate-400">
        Clients you are in touch with. You can only reply to conversations
        started by them — open a thread below to continue the chat.
      </p>
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : threads.length === 0 ? (
        <p className="text-sm text-slate-400">
          No client conversations yet. Clients will appear here after they
          message you first.
        </p>
      ) : (
        <ul className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-900/50">
          {threads.map((t, index) => {
            const id = t.partner?.id;
            const name = t.partner?.name ?? "Unknown";
            if (!id) return null;
            return (
              <li
                key={`${id}-${index}`}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="font-medium text-slate-50">{name}</p>
                  <p className="truncate text-xs text-slate-400 max-w-[280px]">
                    {t.lastMessage}
                  </p>
                </div>
                <Link
                  href={`/trainer/messages?with=${id}`}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-slate-50 hover:bg-emerald-500"
                >
                  Open conversation
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
