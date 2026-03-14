'use client';

import UserShell from '@/components/UserShell';

export default function UserClientsPage() {
  return (
    <UserShell>
      <div id="clients" className="tab-pane">
        <div className="card">
          <h1 className="card-title">Clients</h1>
          <p className="card-subtitle">
            Manage your clients, track their progress, and share new training plans.
          </p>
        </div>
        <div className="card">
          <p className="card-subtitle">
            You don&apos;t have any clients linked yet. Once you start working with athletes, their
            profiles and recent activity will appear here.
          </p>
        </div>
      </div>
    </UserShell>
  );
}

