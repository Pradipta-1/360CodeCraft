'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import UserShell from "@/components/UserShell";
import { apiFetch } from "@/lib/apiFetch";

type Trainer = { id: string; name: string | null; email: string };

export default function UserTrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [routines, setRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      apiFetch("/api/trainers").then(r => r.json()),
      apiFetch("/api/routines/requests").then(r => r.json()),
      apiFetch("/api/routines").then(r => r.json())
    ])
      .then(([trainersData, requestsData, routinesData]) => {
        if (trainersData.success) setTrainers(trainersData.data ?? []);
        else setError(trainersData.error ?? "Failed to load trainers");

        if (requestsData.success) setRequests(requestsData.data ?? []);
        if (routinesData.success) setRoutines(routinesData.data ?? []);
      })
      .catch(() => setError("Failed to load data"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRequestRoutine = async (trainerId: string) => {
    setActionLoading(trainerId);
    try {
      const res = await apiFetch("/api/routines/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainerId })
      });
      if (res.ok) {
        loadData(); // reload to get new requests
      } else {
        const data = await res.json();
        alert(data.error || "Failed to request routine");
      }
    } catch (e) {
      alert("Error requesting routine");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetActive = async (routineId: string, trainerId: string) => {
    setActionLoading(trainerId);
    try {
      const res = await apiFetch(`/api/routines/${routineId}/set-active`, {
        method: "POST",
      });
      if (res.ok) {
        loadData(); // reload to get new active states
      } else {
        const data = await res.json();
        alert(data.error || "Failed to set active routine");
      }
    } catch (e) {
      alert("Error setting routine");
    } finally {
      setActionLoading(null);
    }
  };

  const getTrainerAction = (trainerId: string) => {
    // 1. Check if we have a routine from this trainer
    const routine = routines.find(r => r.trainerId === trainerId);
    if (routine) {
      if (routine.isActive) {
        return (
          <button disabled className="rounded-lg bg-emerald-900/40 border border-emerald-500/30 text-emerald-400 px-4 py-2 text-sm font-semibold opacity-70 cursor-not-allowed">
            Using
          </button>
        );
      } else {
        return (
          <button 
            onClick={() => handleSetActive(routine.id, trainerId)}
            disabled={actionLoading === trainerId}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors disabled:opacity-50"
          >
            {actionLoading === trainerId ? "Setting..." : "Set Routine"}
          </button>
        );
      }
    }

    // 2. Check if we have a pending request
    const request = requests.find(r => r.trainerId === trainerId);
    if (request && request.status === "PENDING") {
      return (
        <button disabled className="rounded-lg bg-slate-800 text-slate-400 px-4 py-2 text-sm font-semibold opacity-70 cursor-not-allowed">
          Requested
        </button>
      );
    }

    // 3. Otherwise, show "Request Routine"
    return (
      <button 
        onClick={() => handleRequestRoutine(trainerId)}
        disabled={actionLoading === trainerId}
        className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-600 transition-colors border border-slate-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-50"
      >
        {actionLoading === trainerId ? "Requesting..." : "Request Routine"}
      </button>
    );
  };

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
                  className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-4 gap-4 hover:bg-white/5 transition-colors"
                >
                  <div>
                    <p className="font-medium text-white">{t.name ?? "Unnamed"}</p>
                    <p className="text-sm text-slate-400">{t.email}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {getTrainerAction(t.id)}
                    <Link
                      href={`/user/messages?with=${t.id}`}
                      className="rounded-lg bg-[#00c896] px-4 py-2 text-sm font-semibold text-white hover:bg-[#00a87a] transition-colors"
                    >
                      Message
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </UserShell>
  );
}
