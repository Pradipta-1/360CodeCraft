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

export default function UserDashboardPage() {
  const [activeRoutine, setActiveRoutine] = useState<ActiveRoutine | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActiveRoutine() {
      try {
        const res = await apiFetch('/api/routines?active=true');
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          setActiveRoutine(data.data[0]);
        }
      } catch (err) {
        console.error('Failed to load active routine:', err);
      } finally {
        setLoading(false);
      }
    }
    loadActiveRoutine();
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

        {/* Active Routine Section */}
        <div className="card">
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

        <div className="card hero-card">
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
