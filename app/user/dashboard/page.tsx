'use client';

import { useEffect, useState } from 'react';
import UserShell from '@/components/UserShell';
import { apiFetch } from '@/lib/apiFetch';

type WorkoutPlan = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  trainer: {
    name: string;
  };
};

export default function UserDashboardPage() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlans() {
      try {
        const res = await apiFetch('/api/workout-plans');
        const data = await res.json();
        if (data.success) {
          setPlans(data.data);
        }
      } catch (err) {
        console.error('Failed to load plans:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPlans();
  }, []);

  const latestPlan = plans[0];

  return (
    <UserShell>
      <div id="dashboard" className="tab-pane active">
        <div className="card">
          <h1 className="card-title">User Dashboard</h1>
          <p className="card-subtitle">
            Welcome back! Here is a summary of your fitness journey.
          </p>
        </div>

        {/* Workout Plan Section */}
        <div className="card">
          <h2 className="card-title" style={{ fontSize: '20px', color: 'var(--brand-primary)' }}>
            Latest Workout Plan
          </h2>
          {loading ? (
            <p className="card-subtitle">Loading plan...</p>
          ) : latestPlan ? (
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '10px' }}>
                {latestPlan.title}
              </h3>
              <p 
                className="card-subtitle" 
                style={{ 
                  whiteSpace: 'pre-wrap', 
                  background: 'rgba(255,255,255,0.05)', 
                  padding: '20px', 
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  lineHeight: '1.6'
                }}
              >
                {latestPlan.description}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '12px' }}>
                Assigned by {latestPlan.trainer?.name ? `Trainer ${latestPlan.trainer.name}` : 'You'} on {new Date(latestPlan.createdAt).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <p className="card-subtitle" style={{ marginTop: '10px' }}>
              No workout plans assigned yet. Contact a trainer to get started!
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
