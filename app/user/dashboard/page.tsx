'use client';

import UserShell from '@/components/UserShell';

export default function UserDashboardPage() {
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
      </div>
    </UserShell>
  );
}

