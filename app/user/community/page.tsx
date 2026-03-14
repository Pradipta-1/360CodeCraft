import UserShell from "@/components/UserShell";

export default function UserCommunityPage() {
  return (
    <UserShell>
      <div id="community" className="tab-pane">
        <div className="card">
          <h1 className="card-title">Community</h1>
          <p className="card-subtitle">
            Community posts, fitness achievements, and group challenges will appear here.
          </p>
        </div>
      </div>
    </UserShell>
  );
}

