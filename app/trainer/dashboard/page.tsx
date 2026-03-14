'use client';

import { useEffect, useState } from "react";
import TrainerShell from "@/components/TrainerShell";
import Link from "next/link";

type WorkoutPlan = {
  id: string;
  clientId: string;
  title: string;
  createdAt: string;
  client: {
    name: string;
  };
};

export default function TrainerDashboardPage() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadPlans() {
    try {
      const res = await fetch('/api/workout-plans');
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

  useEffect(() => {
    loadPlans();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this workout plan?")) return;
    
    try {
      const res = await fetch(`/api/workout-plans/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setPlans(prev => prev.filter(p => p.id !== id));
      } else {
        alert(data.error || "Failed to delete plan");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("An error occurred while deleting");
    }
  }

  return (
    <TrainerShell>
      <div id="dashboard" className="tab-pane active">
        <div className="card">
          <h1 className="card-title">Trainer Dashboard</h1>
          <p className="card-subtitle">
            Welcome back! Monitor your clients and manage their workout schedules.
          </p>
        </div>

        <div className="card">
          <h2 className="card-title" style={{ fontSize: '20px', color: 'var(--brand-primary)' }}>
            Recent Workout Plans
          </h2>
          {loading ? (
            <p className="card-subtitle">Loading plans...</p>
          ) : plans.length > 0 ? (
            <div className="dashboard-grid" style={{ marginTop: '20px' }}>
              {plans.slice(0, 4).map(plan => (
                <div key={plan.id} className="dashboard-small-card">
                  <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '5px' }}>{plan.title}</h3>
                  <p className="card-subtitle" style={{ fontSize: '13px' }}>Client: {plan.client.name}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '8px' }}>
                    {new Date(plan.createdAt).toLocaleDateString()}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <Link href={`/trainer/clients/${plan.clientId}/plan`} style={{ flex: 1 }}>
                      <button className="action-btn" style={{ fontSize: '12px', width: '100%', padding: '8px 4px' }}>Update</button>
                    </Link>
                    <button 
                      onClick={() => handleDelete(plan.id)}
                      className="action-btn" 
                      style={{ 
                        fontSize: '12px', 
                        flex: 1, 
                        background: 'rgba(239, 68, 68, 0.1)', 
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#fca5a5',
                        padding: '8px 4px'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="card-subtitle" style={{ marginTop: '10px' }}>
              No workout plans created yet. Go to the Clients tab to assign one!
            </p>
          )}
        </div>

        <div className="card hero-card">
          <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop" alt="Trainer hero" className="hero-img" />
          <div className="hero-overlay" />
          <div className="hero-content">
            <h2>Lead Your Team</h2>
            <p className="card-subtitle" style={{ color: '#ddd' }}>
              Review performance metrics and confirm your presence at events.
            </p>
          </div>
        </div>
      </div>
    </TrainerShell>
  );
}
