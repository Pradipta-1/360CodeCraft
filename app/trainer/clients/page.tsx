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
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [daysData, setDaysData] = useState(
    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => ({ day, title: "", description: "" }))
  );
  const [submitting, setSubmitting] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      apiFetch("/api/users").then((res) => res.json()),
      apiFetch("/api/routines/requests").then((res) => res.json())
    ])
      .then(([usersData, requestsData]) => {
        if (usersData.success && Array.isArray(usersData.data)) {
          setClients(usersData.data);
        } else {
          setError(usersData.error ?? "Failed to load clients");
        }

        if (requestsData.success) {
          setRequests(requestsData.data);
        }
      })
      .catch(() => setError("Failed to load data"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingRequests = requests.filter(r => r.status === "PENDING");

  const handleOpenModal = (clientId: string) => {
    setSelectedClientId(clientId);
    setDaysData(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => ({ day, title: "", description: "" })));
    setActiveDayIndex(0);
  };

  const handleCloseModal = () => {
    setSelectedClientId(null);
  };

  const handleDayChange = (field: "title" | "description", value: string) => {
    const newData = [...daysData];
    newData[activeDayIndex][field] = value;
    setDaysData(newData);
  };

  const handleSendPlan = async () => {
    // Validate that all days have a title and description
    const isValid = daysData.every(d => d.title.trim() !== "" && d.description.trim() !== "");
    if (!isValid) {
      alert("Please fill out the title and description for all 7 days before sending.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch("/api/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClientId,
          days: daysData
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        handleCloseModal();
        loadData(); // reload requests
      } else {
        alert(data.error || "Failed to send routine plan.");
      }
    } catch (e) {
      alert("Error sending routine plan.");
    } finally {
      setSubmitting(false);
    }
  };


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
                  className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-4 gap-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400">
                      {c.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">{c.name ?? "Unnamed"}</p>
                      </div>
                      <p className="text-sm text-slate-400">{c.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {pendingRequests.some(r => r.userId === c.id) && (
                      <button 
                        onClick={() => handleOpenModal(c.id)}
                        className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-colors animate-pulse"
                      >
                        <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_red]"></span>
                        Setup Routine
                      </button>
                    )}
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

      {/* Routine Creation Modal */}
      {selectedClientId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
            
            {/* Sidebar Navigation */}
            <div className="w-full md:w-32 bg-slate-800/50 border-r border-slate-700 p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto">
              {daysData.map((d, idx) => (
                <button
                  key={d.day}
                  onClick={() => setActiveDayIndex(idx)}
                  className={`flex-shrink-0 py-3 px-2 rounded-xl text-sm font-bold transition-all ${
                    activeDayIndex === idx 
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {d.day}
                  {(d.title && d.description) && activeDayIndex !== idx && (
                    <span className="inline-block ml-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  )}
                </button>
              ))}
            </div>

            {/* Main Content Area */}
            <div className="p-6 md:p-8 flex-1 flex flex-col bg-slate-900">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold font-white">Create 7-Day Routine</h2>
                  <p className="text-slate-400 text-sm">Fill details for {daysData[activeDayIndex].day} below.</p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="rounded-full p-2 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Title for {daysData[activeDayIndex].day}</label>
                  <input
                    type="text"
                    value={daysData[activeDayIndex].title}
                    onChange={(e) => handleDayChange("title", e.target.value)}
                    placeholder="e.g. Upper Body Strength"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Description / Exercises</label>
                  <textarea
                    value={daysData[activeDayIndex].description}
                    onChange={(e) => handleDayChange("description", e.target.value)}
                    placeholder="1. Bench Press 3x10\n2. Incline Dumbbell Press 3x12..."
                    rows={8}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all resize-none font-mono text-sm leading-relaxed"
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
                <div className="flex gap-2">
                  {activeDayIndex > 0 && (
                    <button 
                      onClick={() => setActiveDayIndex(i => i - 1)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 text-sm font-medium transition-colors"
                    >
                      Prev Day
                    </button>
                  )}
                  {activeDayIndex < 6 && (
                    <button 
                      onClick={() => setActiveDayIndex(i => i + 1)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 text-sm font-medium transition-colors"
                    >
                      Next Day
                    </button>
                  )}
                </div>
                <button
                  onClick={handleSendPlan}
                  disabled={submitting}
                  className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? "Sending..." : "Send Plan"}
                  {!submitting && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </TrainerShell>
  );
}
