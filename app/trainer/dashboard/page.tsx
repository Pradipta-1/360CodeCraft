'use client';

import { useEffect, useState } from "react";
import TrainerShell from "@/components/TrainerShell";
import Link from "next/link";
import { apiFetch } from "@/lib/apiFetch";

type Routine = {
  id: string;
  userId: string;
  isActive: boolean;
  user: {
    name: string;
    avatarUrl?: string | null;
  };
  createdAt: string;
};

export default function TrainerDashboardPage() {
  const [activeRoutines, setActiveRoutines] = useState<Routine[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [trainerProfile, setTrainerProfile] = useState<any | null>(null);
  const [clientRoutine, setClientRoutine] = useState<any | null>(null);
  const [prevRoutines, setPrevRoutines] = useState<any[]>([]);
  const [clientProgress, setClientProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Calendar State
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  async function loadDashboardData() {
    try {
      const [routinesRes, meRes] = await Promise.all([
        apiFetch('/api/routines'),
        apiFetch('/api/auth/me')
      ]);
      const routinesData = await routinesRes.json();
      const meData = await meRes.json();

      if (meData.success) {
        setTrainerProfile(meData.data);
      }

      if (routinesData.success) {
        setActiveRoutines(routinesData.data ?? []);
        if (routinesData.data && routinesData.data.length > 0) {
          setSelectedClientId(routinesData.data[0].userId);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadClientData(clientId: string) {
    setProgressLoading(true);
    try {
      const [routineRes, progressRes] = await Promise.all([
        apiFetch(`/api/routines?userId=${clientId}`), // We need active routine for this user
        apiFetch(`/api/progress?clientId=${clientId}`)
      ]);
      const routineData = await routineRes.json();
      const progressData = await progressRes.json();

      if (routineData.success) {
        // Find the active routine assigned by this trainer
        const active = routineData.data.find((x: any) => x.userId === clientId && x.isActive);
        // Find archived routines by this trainer
        // @ts-ignore - Prisma type issue on this environment
        const archived = routineData.data.filter((x: any) => x.userId === clientId && x.isArchived);
        
        setClientRoutine(active || null);
        setPrevRoutines(archived || []);
      }
      if (progressData.success) {
        setClientProgress(progressData.data ?? []);
      }
    } catch (err) {
      console.error('Error loading client data:', err);
    } finally {
      setProgressLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      loadClientData(selectedClientId);
    }
  }, [selectedClientId]);

  // Calendar Helpers (Reused from User Dashboard)
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const dayNumber = i - firstDay + 1;
    if (dayNumber > 0 && dayNumber <= daysInMonth) {
      return { date: new Date(viewYear, viewMonth, dayNumber), dayNumber };
    }
    return null;
  });

  const getDayProgress = (d: Date) => {
    const ds = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split("T")[0];
    // Isolation: Only show progress that matches THIS trainer's name
    return clientProgress.find(p => p.dateString === ds && p.trainerName === trainerProfile?.name);
  };

  const selectedClient = activeRoutines.find(r => r.userId === selectedClientId);

  const handleDayClick = (d: Date) => {
    const scrollContainer = document.querySelector('.main-content');
    if (scrollContainer) {
      setPrevScrollPos(scrollContainer.scrollTop);
    }
    setSelectedDate(d);
    
    // Smoothly scroll to center the Progress Tracker card within .main-content
    setTimeout(() => {
      const trackerCard = document.getElementById('progress-tracker-card');
      if (trackerCard && scrollContainer) {
        const rect = trackerCard.getBoundingClientRect();
        const containerRect = scrollContainer.getBoundingClientRect();
        const currentScroll = scrollContainer.scrollTop;
        
        // Calculate offset to center the card in the viewport
        const targetY = currentScroll + rect.top - (window.innerHeight / 2) + (rect.height / 2);
        
        scrollContainer.scrollTo({ top: targetY > 0 ? targetY : 0, behavior: 'smooth' });
      }
    }, 10);
  };

  const handleCloseModal = () => {
    setSelectedDate(null);
    const scrollContainer = document.querySelector('.main-content');
    if (scrollContainer && prevScrollPos !== 0) {
      scrollContainer.scrollTo({ top: prevScrollPos, behavior: 'smooth' });
    }
  };

  return (
    <>
    <TrainerShell>
      <div id="dashboard" className="tab-pane active space-y-6 min-h-[150vh] pb-[80vh]">
        <div className="card flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="card-title">Trainer Dashboard</h1>
            <p className="card-subtitle">Monitor client progress and workout consistency.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select Client</span>
            <select 
              value={selectedClientId || ""}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-all cursor-pointer min-w-[200px]"
            >
              {activeRoutines
                .filter((r, index, self) => index === self.findIndex((t) => t.userId === r.userId))
                .map(r => (
                  <option key={r.userId} value={r.userId}>{r.user.name}</option>
                ))
              }
            </select>
          </div>
        </div>

        {selectedClientId ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Left: Client Routine */}
            <div className="card flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="card-title" style={{ fontSize: '20px', color: 'var(--brand-primary)' }}>
                  Assigned 7-Day Routine
                </h2>
                <Link href="/trainer/clients">
                  <button className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-wider">
                    Edit Routine
                  </button>
                </Link>
              </div>

              {progressLoading ? (
                <div className="flex-1 flex items-center justify-center p-12 text-slate-500 italic">Updating routine view...</div>
              ) : clientRoutine ? (
                <div className="space-y-3">
                   {clientRoutine.days.map((d: any, i: number) => {
                     const todayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][today.getDay()];
                     const isToday = d.day === todayName;
                     return (
                       <div key={i} className={`p-4 rounded-xl border transition-all ${isToday ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10'}`}>
                         <div className="flex items-center gap-3 mb-1">
                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isToday ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>{d.day}</span>
                           <h4 className="text-white font-semibold text-sm">{d.title || "Rest Day"}</h4>
                         </div>
                         {d.description && <p className="text-xs text-slate-400 line-clamp-2 mt-2 font-mono">{d.description}</p>}
                       </div>
                     );
                   })}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center p-12 text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl text-center">
                  <div>
                    <p className="mb-2">No active routine found.</p>
                    <Link href="/trainer/clients" className="text-emerald-500 font-bold hover:underline">Set a Plan</Link>
                  </div>
                </div>
              )}

              {/* History Section */}
              {prevRoutines.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-800/50">
                  <button 
                    onClick={() => setShowHistory(!showHistory)}
                    className="w-full flex items-center justify-between group"
                  >
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">
                      Previously Assigned ({prevRoutines.length})
                    </h3>
                    <svg 
                      className={`w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-all ${showHistory ? 'rotate-180' : ''}`} 
                      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>

                  <div className={`mt-4 space-y-3 overflow-hidden transition-all duration-300 ${showHistory ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    {prevRoutines.map((pr, idx) => (
                      <button 
                        key={pr.id}
                        onClick={() => setClientRoutine(pr)}
                        className="w-full p-4 rounded-xl border border-slate-800 bg-slate-800/20 hover:bg-slate-800/40 transition-all text-left flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-300">Routine from {new Date(pr.createdAt).toLocaleDateString()}</p>
                          <p className="text-xs text-slate-500 mt-1">{pr.days[0].title} & more...</p>
                        </div>
                        <span className="text-xs font-bold text-emerald-500/50 uppercase">View</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Client Progress Calendar */}
            <div id="progress-tracker-card" className="card h-full flex flex-col">
              <h2 className="card-title" style={{ fontSize: '20px', color: 'var(--brand-primary)' }}>
                Progress Tracker
              </h2>
              <p className="card-subtitle mt-1">Consistency report for {selectedClient?.user.name}</p>

              <div className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-white font-bold text-lg">
                     {new Date(viewYear, viewMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                   </h3>
                   <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
                     <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500"></span><span className="text-slate-500">Done</span></div>
                     <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-red-500"></span><span className="text-slate-500">Skip</span></div>
                   </div>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-2">
                  {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <div key={i} className="text-center text-[10px] font-black text-slate-600 py-1 uppercase">{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((d, i) => {
                    if (!d) return <div key={i} className="aspect-square"></div>;
                    const prog = getDayProgress(d.date);
                    const isFuture = d.date > today;

                    let boxClass = "bg-slate-800/40 border border-slate-700/50";
                    if (prog) {
                      boxClass = prog.isCompleted 
                        ? "bg-emerald-500 border-none shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                        : "bg-red-500 border-none shadow-[0_0_15px_rgba(239,68,68,0.2)]";
                    } else if (isFuture) {
                      boxClass = "bg-slate-950/20 border-slate-900 opacity-20";
                    }

                    return (
                      <button 
                        key={i} 
                        onClick={() => prog && handleDayClick(d.date)}
                        disabled={!prog}
                        title={prog ? (prog.isCompleted ? 'Completed' : 'Skipped') : ''} 
                        className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all ${prog ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'} ${boxClass}`}
                      >
                        <span className={prog ? "text-white" : "text-slate-600"}>{d.dayNumber}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Legend/Footer */}
                <div className="mt-auto pt-8 flex justify-between items-end">
                   <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Time Machine</p>
                      <div className="flex gap-2">
                         <button onClick={() => setViewMonth(m => m === 0 ? 11 : m - 1)} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors">
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                         </button>
                         <button onClick={() => setViewMonth(m => m === 11 ? 0 : m + 1)} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors">
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                         </button>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status</p>
                      <p className="text-white text-xs font-semibold">Interactive View</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-800">
             <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-3xl mb-4">🏠</div>
             <h2 className="text-xl font-bold text-white mb-2">Welcome Trainer</h2>
             <p className="text-slate-400 max-w-xs text-sm">Select a client from the dropdown to start monitoring their routines and performance.</p>
          </div>
        )}

        <div className="card hero-card mt-6">
          <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop" alt="Trainer hero" className="hero-img" />
          <div className="hero-overlay" />
          <div className="hero-content">
            <h2>Lead Your Team</h2>
            <p className="card-subtitle" style={{ color: '#ddd' }}>
              Review performance metrics and monitor client progress.
            </p>
          </div>
        </div>
      </div>
    </TrainerShell>

    {/* Day Detail Modal for Trainer - MOVED TO ABSOLUTE ROOT TO ESCAPE ALL CONTAINERS */}
    {selectedDate && (
      <div 
        className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300"
        onClick={handleCloseModal}
      >
        <div 
          className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {(() => {
            const d = selectedDate!;
            const ds = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split("T")[0];
            const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
            const prog = getDayProgress(d);
            const scheduledDay = clientRoutine?.days.find((x: any) => x.day === dow);

            return (
              <>
                <div className="p-6 border-b border-slate-800 flex justify-between items-start">
                  <div>
                      <h3 className="text-lg font-bold text-white mb-1">
                        {d.toLocaleDateString('default', { weekday: 'long', month: 'short', day: 'numeric' })}
                      </h3>
                      {prog ? (
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${prog.isCompleted ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
                          {prog.isCompleted ? 'Completed' : 'Skipped'}
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border bg-slate-800 text-slate-400 border-slate-600">
                          Unrecorded
                        </div>
                      )}
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="rounded-full p-2 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
                <div className="p-6 bg-slate-900/50 space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Workout Scheduled</span>
                    <h4 className="text-white font-semibold">{scheduledDay?.title || "Rest Day"}</h4>
                  </div>
                  {scheduledDay?.description && (
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Exercise Plan</span>
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                            {scheduledDay.description}
                        </div>
                      </div>
                  )}
                  
                  {prog && prog.trainerName !== trainerProfile?.name && (
                      <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <p className="text-[10px] text-orange-400 font-medium italic">NOTE: This activity was recorded under a different routine/trainer ({prog.trainerName}).</p>
                      </div>
                  )}
                </div>
                <div className="p-4 bg-slate-900 border-t border-slate-800">
                    <button onClick={handleCloseModal} className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-all">Close</button>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    )}
    </>
  );
}
