'use client';

import { useEffect, useState } from 'react';
import UserShell from '@/components/UserShell';
import { apiFetch } from '@/lib/apiFetch';

type ActiveRoutine = {
  id: string;
  days: { day: string; title: string; description: string }[];
  trainer: {
    name: string;
  };
  createdAt: string;
};

type DailyProgress = {
  id: string;
  dateString: string;
  isCompleted: boolean;
  routineId?: string;
  dayTitle?: string;
  dayDescription?: string;
  trainerName?: string;
};

export default function UserDashboardPage() {
  const [activeRoutine, setActiveRoutine] = useState<ActiveRoutine | null>(null);
  const [allRoutines, setAllRoutines] = useState<any[]>([]);
  const [progress, setProgress] = useState<DailyProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Calendar Modal State
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>("");

  const todayVal = new Date();
  const today = todayVal; 
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [showPicker, setShowPicker] = useState(false);
  const [showStreakHistory, setShowStreakHistory] = useState(false);

  // Today helpers
  const todayDateString = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split("T")[0]; // YYYY-MM-DD
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const todayDayName = daysOfWeek[today.getDay()];

  useEffect(() => {
    async function loadData() {
      try {
        const [activeRoutineRes, allRoutinesRes, progressRes] = await Promise.all([
          apiFetch('/api/routines?active=true'),
          apiFetch('/api/routines'),
          apiFetch('/api/progress')
        ]);

        const activeRoutineData = await activeRoutineRes.json();
        const allRoutinesData = await allRoutinesRes.json();
        const progressData = await progressRes.json();

        if (activeRoutineData.success && activeRoutineData.data && activeRoutineData.data.length > 0) {
          setActiveRoutine(activeRoutineData.data[0]);
          setSelectedRoutineId(activeRoutineData.data[0].id);
        }
        if (allRoutinesData.success) {
          setAllRoutines(allRoutinesData.data ?? []);
        }
        if (progressData.success) {
          setProgress(progressData.data ?? []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const calculateStreak = () => {
    if (progress.length === 0) return 0;
    
    // Sort descending by date
    const sorted = [...progress].sort((a, b) => b.dateString.localeCompare(a.dateString));
    
    let streak = 0;
    const todayStr = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split("T")[0];
    const yesterday = new Date(today.getTime() - today.getTimezoneOffset() * 60000 - 86400000);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const hasTodayCompleted = sorted.find(p => p.dateString === todayStr && p.isCompleted);
    const hasTodaySkipped = sorted.find(p => p.dateString === todayStr && p.isCompleted === false);
    const hasYesterdayCompleted = sorted.find(p => p.dateString === yesterdayStr && p.isCompleted);

    let currentCheck = "";
    if (hasTodayCompleted) {
      currentCheck = todayStr;
    } else if (!hasTodaySkipped && hasYesterdayCompleted) {
      currentCheck = yesterdayStr;
    }

    if (!currentCheck) return 0;

    const getPrevStr = (ds: string) => {
      const d = new Date(ds);
      d.setDate(d.getDate() - 1);
      return d.toISOString().split("T")[0];
    };

    while (true) {
      const found = sorted.find(p => p.dateString === currentCheck);
      if (found && found.isCompleted) {
        streak++;
        currentCheck = getPrevStr(currentCheck);
      } else {
        break;
      }
    }
    return streak;
  };

  const getStreakHistory = () => {
    if (progress.length === 0) return [];
    const sorted = [...progress].sort((a, b) => a.dateString.localeCompare(b.dateString));
    
    const streaks: { start: string; end: string; count: number }[] = [];
    let currentStreak: { start: string; end: string; count: number } | null = null;
    let lastDate: Date | null = null;

    for (const rec of sorted) {
      if (!rec.isCompleted) {
        if (currentStreak && currentStreak.count >= 5) {
          streaks.push(currentStreak);
        }
        currentStreak = null;
        lastDate = null;
        continue;
      }

      const currentDate = new Date(rec.dateString + "T00:00:00Z");
      if (!lastDate) {
        currentStreak = { start: rec.dateString, end: rec.dateString, count: 1 };
      } else {
        const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / 86400000);
        if (diffDays === 1) {
          currentStreak!.count++;
          currentStreak!.end = rec.dateString;
        } else {
          if (currentStreak && currentStreak.count >= 5) {
            streaks.push(currentStreak);
          }
          currentStreak = { start: rec.dateString, end: rec.dateString, count: 1 };
        }
      }
      lastDate = currentDate;
    }
    if (currentStreak && currentStreak.count >= 5) {
      streaks.push(currentStreak);
    }
    return streaks.reverse(); // Newest first
  };

  const streakHistory = getStreakHistory();

  const currentStreak = calculateStreak();

  const handleUpdateProgress = async (
    isCompleted: boolean | null,
    routineData?: { routineId: string; dayTitle: string; dayDescription: string; trainerName: string },
    targetDateString?: string
  ) => {
    setActionLoading(true);
    const ds = targetDateString || todayDateString;
    try {
      const body = isCompleted === null 
        ? { action: "delete", dateString: ds }
        : { dateString: ds, isCompleted, ...routineData };

      const res = await apiFetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Update local state
        setProgress(prev => {
          const filtered = prev.filter(p => p.dateString !== ds);
          return isCompleted === null ? filtered : [...filtered, data.data];
        });
      } else {
        alert(data.error || "Failed to update progress.");
      }
    } catch (e) {
      alert("Error updating progress.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestContinual = async () => {
    const trainerRef = allRoutines.find(r => r.isArchived)?.trainerId;
    if (!trainerRef) return;

    setActionLoading(true);
    try {
      const res = await apiFetch("/api/routines/request-continual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainerId: trainerRef })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Request sent to trainer!");
      } else {
        alert(data.error || "Failed to send request.");
      }
    } catch (e) {
      alert("Error sending request.");
    } finally {
      setActionLoading(false);
    }
  };

  const todayProgress = progress.find(p => p.dateString === todayDateString);

  // Calendar Helpers
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const dayNumber = i - firstDay + 1;
    if (dayNumber > 0 && dayNumber <= daysInMonth) {
      const d = new Date(viewYear, viewMonth, dayNumber);
      return { date: d, dayNumber };
    }
    return null;
  });

  const getDayProgress = (d: Date) => {
    const ds = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split("T")[0];
    return progress.find(p => p.dateString === ds);
  };

  const handleDayClick = (dayDate: Date | null) => {
    if (dayDate) {
      setSelectedDate(dayDate);
    }
  };

  return (
    <UserShell>
      <div id="dashboard" className="tab-pane active">
        <div className="card flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="card-title">User Dashboard</h1>
            <p className="card-subtitle">
              Welcome back! Here is a summary of your fitness journey.
            </p>
          </div>
          {currentStreak >= 5 && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl px-6 py-3 flex items-center gap-3 shadow-[0_0_20px_rgba(249,115,22,0.15)]">
              <span className="text-2xl">🔥</span>
              <div>
                <p className="text-orange-400 font-bold text-sm leading-none mb-1">STREAK ALIVE!</p>
                <p className="text-white text-xs font-medium">You are on a {currentStreak} day streak! Keep it up!</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Active Routine Section */}
          <div className="card h-full">
            <h2 className="card-title" style={{ fontSize: '20px', color: 'var(--brand-primary)' }}>
              Your Active 7-Day Routine
            </h2>
            {loading ? (
              <p className="card-subtitle mt-2">Loading routine...</p>
            ) : activeRoutine ? (
              <div className="mt-6 space-y-4">
                <p className="text-sm text-slate-400 mb-6">
                  Assigned by Trainer <span className="font-semibold text-emerald-400">{activeRoutine.trainer?.name || "Unknown"}</span>
                </p>
                <div className="flex flex-col gap-4">
                  {activeRoutine.days.map((d, i) => {
                    const isToday = d.day === todayDayName;
                    return (
                      <div key={i} className={`bg-white/5 border rounded-xl p-4 transition-all ${isToday ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20' : 'border-white/10'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-md text-sm font-bold w-14 text-center ${isToday ? 'bg-emerald-500 text-white' : 'bg-emerald-500/20 text-emerald-400'}`}>
                              {d.day}
                            </span>
                            <h3 className="text-white font-semibold flex-1">
                              {d.title || "Rest"}
                              {isToday && <span className="ml-2 text-xs text-emerald-400 font-normal tracking-wider uppercase px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10">Today</span>}
                            </h3>
                          </div>

                          {/* Progress Input for Today */}
                          {isToday && (
                            <div className="flex items-center gap-2">
                              {todayProgress?.isCompleted === true ? (
                                <button 
                                  onClick={() => handleUpdateProgress(null)}
                                  disabled={actionLoading}
                                  className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/40 hover:bg-emerald-600 transition-all disabled:opacity-50"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleUpdateProgress(true, { 
                                    routineId: activeRoutine.id, 
                                    dayTitle: d.title || "Rest", 
                                    dayDescription: d.description || "",
                                    trainerName: activeRoutine.trainer?.name || "Unknown"
                                  })}
                                  disabled={actionLoading}
                                  className="w-8 h-8 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all disabled:opacity-50"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </button>
                              )}

                              {todayProgress?.isCompleted === false ? (
                                <button 
                                  onClick={() => handleUpdateProgress(null, {} as any)}
                                  disabled={actionLoading}
                                  className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/40 hover:bg-red-600 transition-all disabled:opacity-50"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleUpdateProgress(false, { 
                                    routineId: activeRoutine.id, 
                                    dayTitle: d.title || "Rest", 
                                    dayDescription: d.description || "",
                                    trainerName: activeRoutine.trainer?.name || "Unknown"
                                  })}
                                  disabled={actionLoading}
                                  className="w-8 h-8 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-400 hover:text-red-400 hover:border-red-500 hover:bg-red-500/10 transition-all disabled:opacity-50"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        {d.description && (
                          <p className={`text-sm whitespace-pre-wrap font-mono mt-3 sm:pl-[68px] ${isToday ? 'text-slate-300' : 'text-slate-400'}`}>
                            {d.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <p className="text-slate-500 mb-6">
                  {allRoutines.some(r => r.isArchived && !r.isActive) 
                    ? "Your routine has been discontinued. Ready to get back to it?"
                    : "No active routine currently. Visit the Trainers tab to request one!"}
                </p>
                {allRoutines.some(r => r.isArchived && !r.isActive) && (
                  <button 
                    onClick={handleRequestContinual}
                    disabled={actionLoading}
                    className="rounded-xl bg-orange-500 px-8 py-3 text-sm font-bold text-white hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
                  >
                    Request Continual
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Monthly Calendar Section */}
          <div className="card h-full">
            <h2 className="card-title" style={{ fontSize: '20px', color: 'var(--brand-primary)' }}>
              Progress Calendar
            </h2>
            <p className="card-subtitle mt-1">Track your monthly workout consistency.</p>

            <div className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <button 
                  onClick={() => setShowPicker(true)}
                  className="flex items-center gap-2 group px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-all text-left"
                >
                  <h3 className="text-white font-bold text-lg group-hover:text-emerald-400 transition-colors">
                    {new Date(viewYear, viewMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h3>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-hover:text-emerald-400 group-hover:translate-y-0.5 transition-all"><path d="m6 9 6 6 6-6"/></svg>
                </button>

                <button
                  onClick={() => setShowStreakHistory(true)}
                  className="px-3 py-1.5 rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-bold hover:bg-orange-500/20 transition-all flex items-center gap-2"
                >
                  <span>🔥</span> Previous Streaks
                </button>

                <div className="flex gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500"></span><span className="text-slate-400">Done</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500"></span><span className="text-slate-400">Skipped</span></div>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <div key={i} className="text-center text-xs font-bold text-slate-500 py-1">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {calendarDays.map((d, i) => {
                  if (!d) return <div key={i} className="aspect-square rounded-lg bg-transparent"></div>;

                  const isFuture = d.date > today;
                  const isTodayBox = d.date.toDateString() === today.toDateString();
                  const prog = getDayProgress(d.date);

                  let boxClass = "bg-slate-800/50 border border-slate-700 hover:border-slate-500";
                  if (prog) {
                    boxClass = prog.isCompleted
                      ? "bg-emerald-500 border-none shadow-[0_0_10px_rgba(16,185,129,0.3)] text-white"
                      : "bg-red-500 border-none shadow-[0_0_10px_rgba(239,68,68,0.3)] text-white";
                  } else if (isFuture) {
                    boxClass = "bg-slate-900/40 border border-slate-800/50 opacity-50 cursor-not-allowed";
                  }

                    return (
                      <button
                        key={i}
                        onClick={() => handleDayClick(d.date)}
                        className={`aspect-square rounded-lg flex items-center justify-center text-sm font-semibold transition-all ${boxClass} ${isTodayBox && !prog ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-900' : ''} cursor-pointer hover:scale-105 hover:z-10`}
                      >
                        <span className={prog ? "text-white" : (isFuture ? "text-slate-600" : "text-slate-300")}>{d.dayNumber}</span>
                      </button>
                    );
                })}
              </div>
            </div>
          </div>

        </div>

        <div className="card hero-card mt-6">
          <img
            className="hero-img"
            src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2070&auto=format&fit=crop"
            alt="Athlete flexing back"
          />
          <div className="hero-overlay" />
          <div className="hero-content">
            <h2>Push Your Limits</h2>
            <p className="card-subtitle" style={{ color: '#ddd' }}>
              Discover new routines and track your progress daily.
            </p>
          </div>
        </div>
      </div>

      {/* Routine Detail Modal */}
      {selectedDate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {(() => {
              const dow = daysOfWeek[selectedDate.getDay()];
              const ds = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000).toISOString().split("T")[0];
              const routineDay = activeRoutine?.days?.find(d => d.day === dow);
              const prog = getDayProgress(selectedDate);
              const isToday = ds === todayDateString;

              return (
                <>
                  <div className="p-6 border-b border-slate-800 flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">
                        {selectedDate.toLocaleDateString('default', { weekday: 'long', month: 'short', day: 'numeric' })}
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
                      onClick={() => setSelectedDate(null)}
                      className="rounded-full p-2 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                  <div className="p-6 bg-slate-900/50 flex-1 overflow-y-auto custom-scrollbar">
                    {prog ? (
                      <div>
                         <div className="mb-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Scheduled Routine</span>
                            <h4 className="text-white font-medium text-lg">{prog.dayTitle || "Rest Day"}</h4>
                            <p className="text-xs text-emerald-400 mt-1 font-semibold">
                              Assigned by {prog.trainerName || "Unknown"}
                           </p>
                         </div>
                        {prog.dayDescription ? (
                          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 max-h-[40vh] overflow-y-auto custom-scrollbar mb-6">
                            <p className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                              {prog.dayDescription}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500 italic mb-6">No exercises recorded.</p>
                        )}

                        <button
                          onClick={() => handleUpdateProgress(null, {} as any, ds).then(() => setSelectedDate(null))}
                          disabled={actionLoading}
                          className="w-full py-3 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-400 font-bold hover:text-white hover:bg-slate-800 hover:border-slate-500 transition-all disabled:opacity-50"
                        >
                          Reset Progress
                        </button>
                      </div>
                    ) : (selectedDate > today) ? (
                      <div>
                        {activeRoutine ? (
                          <>
                            <div className="mb-4">
                               <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Scheduled Routine</span>
                               <h4 className="text-white font-medium text-lg">{routineDay?.title || "Rest Day"}</h4>
                               {activeRoutine?.trainer?.name && (
                                 <p className="text-xs text-emerald-400 mt-1 font-semibold">Assigned by {activeRoutine.trainer.name}</p>
                               )}
                            </div>
                            {routineDay?.description ? (
                              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 max-h-[40vh] overflow-y-auto custom-scrollbar">
                                <p className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                                  {routineDay.description}
                                </p>
                              </div>
                            ) : (
                              <p className="text-sm text-slate-500 italic">No exercises scheduled.</p>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-10">
                            <p className="text-slate-500 text-sm">No active routine scheduled for this date.</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {allRoutines.length > 0 ? (
                          <>
                            <div>
                              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 block">Choose Routine for this day</label>
                              <div className="space-y-2">
                                {allRoutines.filter(r => !r.isArchived).map(r => (
                                  <label key={r.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${selectedRoutineId === r.id ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-slate-800/40 border-slate-700 hover:border-slate-500'}`}>
                                    <input 
                                      type="radio" 
                                      name="retroactiveRoutine" 
                                      value={r.id} 
                                      checked={selectedRoutineId === r.id}
                                      onChange={() => setSelectedRoutineId(r.id)}
                                      className="mt-1 accent-emerald-500"
                                    />
                                    <div className="flex-1">
                                      <div className="text-sm font-semibold text-white">7-Day Plan</div>
                                      <div className="text-xs text-slate-400">Assigned by {r.trainer?.name} • ({new Date(r.createdAt).toLocaleDateString()})</div>
                                    </div>
                                  </label>
                                ))}
                              </div>
                            </div>

                            {selectedRoutineId && (
                              <div className="flex gap-3">
                                <button
                                  onClick={() => {
                                    const r = allRoutines.find(x => x.id === selectedRoutineId);
                                    const d = r.days.find((x: any) => x.day === dow);
                                    handleUpdateProgress(true, {
                                      routineId: r.id,
                                      dayTitle: d?.title || "Rest",
                                      dayDescription: d?.description || "",
                                      trainerName: r.trainer?.name || "Unknown"
                                    }, ds).then(() => setSelectedDate(null));
                                  }}
                                  disabled={actionLoading}
                                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                                >
                                  Record Done
                                </button>
                                <button
                                  onClick={() => {
                                    const r = allRoutines.find(x => x.id === selectedRoutineId);
                                    const d = r.days.find((x: any) => x.day === dow);
                                    handleUpdateProgress(false, {
                                      routineId: r.id,
                                      dayTitle: d?.title || "Rest",
                                      dayDescription: d?.description || "",
                                      trainerName: r.trainer?.name || "Unknown"
                                    }, ds).then(() => setSelectedDate(null));
                                  }}
                                  disabled={actionLoading}
                                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-500/20 transition-all disabled:opacity-50"
                                >
                                  Skipped
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-10">
                            <p className="text-slate-500 text-sm">No routines available to log for this date.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Month/Year Context Picker */}
      {showPicker && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-bold text-lg">Select Month & Year</h3>
                <button onClick={() => setShowPicker(false)} className="text-slate-400 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Month</label>
                  <select 
                    value={viewMonth}
                    onChange={(e) => setViewMonth(parseInt(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
                  >
                    {Array.from({ length: 12 }, (_, i) => {
                      const isDisabled = viewYear === today.getFullYear() && i > today.getMonth();
                      return (
                        <option key={i} value={i} disabled={isDisabled}>
                          {new Date(0, i).toLocaleString('default', { month: 'long' })}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Year</label>
                  <select 
                    value={viewYear}
                    onChange={(e) => {
                      const newYear = parseInt(e.target.value);
                      setViewYear(newYear);
                      // Adjust month if the new year makes current month invalid (future)
                      if (newYear === today.getFullYear() && viewMonth > today.getMonth()) {
                        setViewMonth(today.getMonth());
                      }
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
                  >
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = today.getFullYear() - i;
                      return <option key={year} value={year}>{year}</option>;
                    })}
                  </select>
                </div>

                <button 
                  onClick={() => setShowPicker(false)}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 mt-2"
                >
                  View History
                </button>
              </div>
           </div>
        </div>
      )}

      {/* Streak History Modal */}
      {showStreakHistory && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <span>🔥</span> Streak History
              </h3>
              <button onClick={() => setShowStreakHistory(false)} className="text-slate-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
              {streakHistory.length > 0 ? (
                streakHistory.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const endDate = new Date(s.end + "T00:00:00Z");
                      setViewMonth(endDate.getUTCMonth());
                      setViewYear(endDate.getUTCFullYear());
                      setShowStreakHistory(false);
                    }}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center justify-between hover:border-orange-500/50 hover:bg-orange-500/5 transition-all group"
                  >
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        {new Date(s.start + "T00:00:00Z").toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(s.end + "T00:00:00Z").toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-white font-bold text-lg group-hover:text-orange-400 transition-colors">{s.count} Day Streak</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500 text-sm">No streaks of 5+ days found yet.</p>
                  <p className="text-slate-600 text-[10px] mt-1">Keep working out to build your first one!</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowStreakHistory(false)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl border border-slate-700 transition-all mt-6"
            >
              Close
            </button>
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
    </UserShell>
  );
}
