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
  const [loading, setLoading] = useState(true);

  async function loadDashboardData() {
    try {
      const res = await apiFetch('/api/routines');
      const data = await res.json();

      if (data.success) {
        // Show routines that clients are currently using (isActive: true)
        const active = (data.data ?? []).filter((r: Routine) => r.isActive);
        setActiveRoutines(active);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <TrainerShell>
      <div id="dashboard" className="tab-pane active">
        <div className="card">
          <h1 className="card-title">Trainer Dashboard</h1>
          <p className="card-subtitle">
            Welcome back! Monitor your clients and manage their workout schedules.
          </p>
        </div>

        {/* Active Client Routines Section */}
        <div className="card">
          <h2 className="card-title" style={{ fontSize: '20px', color: 'var(--brand-primary)' }}>
            Active Client Routines
          </h2>
          <p className="card-subtitle mt-1">Clients currently using your 7-day routines.</p>
          
          {loading ? (
            <p className="card-subtitle mt-4">Loading active routines...</p>
          ) : activeRoutines.length > 0 ? (
            <div className="dashboard-grid" style={{ marginTop: '20px' }}>
              {activeRoutines.map(routine => (
                <div key={routine.id} className="dashboard-small-card bg-emerald-500/5 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <h3 style={{ color: '#fff', fontSize: '16px' }}>{routine.user.name}</h3>
                  </div>
                  <p className="card-subtitle" style={{ fontSize: '13px' }}>Currently Active</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '8px' }}>
                    Assigned: {new Date(routine.createdAt).toLocaleDateString()}
                  </p>
                  <div style={{ marginTop: '12px' }}>
                    <Link href={`/trainer/messages?with=${routine.userId}`}>
                      <button className="action-btn" style={{ fontSize: '12px', width: '100%', padding: '8px 4px' }}>Check In</button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 text-center py-8 border-2 border-dashed border-slate-800 rounded-2xl">
              <p className="text-slate-500 text-sm">No clients have activated shared routines yet.</p>
            </div>
          )}
        </div>

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
  );
}
