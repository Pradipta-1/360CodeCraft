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

type WorkoutPlan = {
  id: string;
  title: string;
  description: string;
  trainer: {
    name: string;
  };
  createdAt: string;
};

export default function UserDashboardPage() {
  const [activeRoutine, setActiveRoutine] = useState<ActiveRoutine | null>(null);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [routineRes, plansRes] = await Promise.all([
          apiFetch('/api/routines?active=true'),
          apiFetch('/api/workout-plans')
        ]);
        
        const routineData = await routineRes.json();
        const plansData = await plansRes.json();

        if (routineData.success && routineData.data && routineData.data.length > 0) {
          setActiveRoutine(routineData.data[0]);
        }
        if (plansData.success) {
          setWorkoutPlans(plansData.data ?? []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <UserShell>
      <div id="dashboard" className="tab-pane active">
        <div className="card">
          <h1 className="card-title">User Dashboard</h1>
          <p className="card-subtitle">
            Welcome back! Here is a summary of your fitness journey.
          </p>
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
                  {activeRoutine.days.map((d, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-md text-sm font-bold w-14 text-center">
                          {d.day}
                        </span>
                        <h3 className="text-white font-semibold flex-1">
                          {d.title || "Rest"}
                        </h3>
                      </div>
                      {d.description && (
                        <p className="text-slate-400 text-sm whitespace-pre-wrap font-mono mt-3 sm:pl-[68px]">
                          {d.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="card-subtitle mt-4">
                No active routine currently. Visit the Trainers tab to request one!
              </p>
            )}
          </div>

          {/* Workout Plans Section */}
          <div className="card h-full">
            <h2 className="card-title" style={{ fontSize: '20px', color: 'var(--brand-primary)' }}>
              Personalised Workout Plans
            </h2>
            <p className="card-subtitle mt-1">Deep dives into your specific training programs.</p>

            {loading ? (
              <p className="card-subtitle mt-6">Loading plans...</p>
            ) : workoutPlans.length > 0 ? (
              <div className="mt-8 space-y-6">
                {workoutPlans.map((plan) => (
                  <div key={plan.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 transition-all hover:border-emerald-500/30 group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{plan.title}</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                          Assigned by {plan.trainer.name} • {new Date(plan.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">
                      {plan.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-12 text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl">
                <svg className="w-12 h-12 text-slate-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <p className="text-slate-500 text-sm">No workout plans assigned yet.</p>
              </div>
            )}
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
    </UserShell>
  );
}
