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
    <div id="clients" className="tab-pane active">
      <div className="card">
        <h1 className="card-title">Clients</h1>
        <p className="card-subtitle mb-6">
          Clients you are in touch with. You can only reply to conversations
          started by them — open a thread below to continue the chat.
        </p>

        {error && (
          <p className="text-sm text-red-400 mb-4">{error}</p>
        )}
        
        {loading ? (
          <p className="card-subtitle">Loading…</p>
        ) : threads.length === 0 ? (
          <p className="card-subtitle">
            No client conversations yet. Clients will appear here after they
            message you first.
          </p>
        ) : (
          <ul className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-[#0a0a0c]">
            {threads.map((t, index) => {
              const id = t.partner?.id;
              const name = t.partner?.name ?? "Unknown";
              if (!id) return null;
              return (
                <li
                  key={`${id}-${index}`}
                  className="flex items-center justify-between px-4 py-4 hover:bg-white/5 transition-colors"
                >
                  <div>
                    <p className="font-medium text-white">{name}</p>
                    <p className="truncate text-sm text-slate-400 max-w-[280px]">
                      {t.lastMessage}
                    </p>
                  </div>
                  <Link
                    href={`/trainer/messages?with=${id}`}
                    className="rounded-lg bg-[#00c896] px-4 py-2 text-sm font-semibold text-white hover:bg-[#00a87a] transition-colors"
                  >
                    Open conversation
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
