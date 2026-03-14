"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import TrainerShell from "@/components/TrainerShell";
import { apiFetch } from "@/lib/apiFetch";

type Client = {
  id: string;
  name: string | null;
  email: string;
};

export default function TrainerClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setClients(data.data);
        } else {
          setError(data.error ?? "Failed to load clients");
        }
      })
      .catch(() => setError("Failed to load clients"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <TrainerShell>
      <div id="clients" className="tab-pane active">
        <div className="card">
          <h1 className="card-title">Clients</h1>
          <p className="card-subtitle mb-6">
            All registered users on the platform. Open a conversation or set a
            workout plan for any client.
          </p>

          {error && (
            <p className="text-sm text-red-400 mb-4">{error}</p>
          )}

          {loading ? (
            <p className="card-subtitle">Loading…</p>
          ) : clients.length === 0 ? (
            <p className="card-subtitle">No clients found.</p>
          ) : (
            <ul className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-[#0a0a0c]">
              {clients.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between px-4 py-4 hover:bg-white/5 transition-colors"
                >
                  <div>
                    <p className="font-medium text-white">{c.name ?? "Unnamed"}</p>
                    <p className="text-sm text-slate-400">{c.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/trainer/clients/${c.id}/plan`}
                      className="rounded-lg border border-[#00c896]/40 bg-transparent px-4 py-2 text-sm font-semibold text-[#00c896] hover:bg-[#00c896]/10 transition-colors"
                    >
                      Set Plan
                    </Link>
                    <Link
                      href={`/trainer/messages?with=${c.id}`}
                      className="rounded-lg bg-[#00c896] px-4 py-2 text-sm font-semibold text-white hover:bg-[#00a87a] transition-colors"
                    >
                      Open conversation
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </TrainerShell>
  );
}
