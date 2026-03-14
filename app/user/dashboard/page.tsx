'use client';

import { useEffect, useState } from 'react';
import UserShell from '@/components/UserShell';

type WorkoutPlan = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  trainer?: { id: string; name: string | null } | null;
};

export default function UserDashboardPage() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPlans() {
      setLoadingPlans(true);
      setPlansError(null);
      try {
        const res = await fetch('/api/workout-plans', { credentials: 'include' });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to load workout plans');
        }
        if (!cancelled) {
          setPlans(data.data ?? []);
        }
      } catch (e) {
        if (!cancelled) {
          setPlansError(e instanceof Error ? e.message : 'Failed to load workout plans');
        }
      } finally {
        if (!cancelled) {
          setLoadingPlans(false);
        }
      }
    }

    loadPlans();
    return () => {
      cancelled = true;
    };
  }, []);

  const latestPlan = plans[0];

  return (
    <UserShell>
      <div id="dashboard" className="tab-pane active">
        <div className="card">
          <h1 className="card-title">User Dashboard</h1>
          <p className="card-subtitle">
            Recommended events, featured trainers, joined events, and community activity will appear
            here.
          </p>
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

        <div className="card">
          <h2 className="card-title" style={{ fontSize: 20 }}>
            Your Workout Plan
          </h2>
          {plansError && (
            <p className="card-subtitle" style={{ color: '#fecaca' }}>
              {plansError}
            </p>
          )}
          {!plansError && loadingPlans && (
            <p className="card-subtitle">Loading your workout plan…</p>
          )}
          {!plansError && !loadingPlans && !latestPlan && (
            <p className="card-subtitle">
              You don&apos;t have a workout plan yet. Once your trainer assigns one, it will appear
              here.
            </p>
          )}
          {!plansError && !loadingPlans && latestPlan && (
            <div className="mt-3 space-y-2">
              <p className="text-lg font-semibold text-white">{latestPlan.title}</p>
              {latestPlan.trainer?.name && (
                <p className="text-xs text-slate-400">
                  Assigned by {latestPlan.trainer.name}
                </p>
              )}
              <p className="card-subtitle" style={{ whiteSpace: 'pre-wrap' }}>
                {latestPlan.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </UserShell>
  );
}

