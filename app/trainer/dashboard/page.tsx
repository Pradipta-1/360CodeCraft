export default function TrainerDashboardPage() {
  return (
    <div id="dashboard" className="tab-pane active">
      <div className="card">
        <h1 className="card-title">Trainer Dashboard</h1>
        <p className="card-subtitle">
          Invitations, upcoming confirmed events, and earnings summary will appear here.
        </p>
      </div>
      <div className="card hero-card">
        <img src="/fitnessss.png" alt="Trainer hero" className="hero-img" />
        <div className="hero-overlay" />
      </div>
    </div>
  );
}

