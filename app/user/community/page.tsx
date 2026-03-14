"use client";

import UserShell from "@/components/UserShell";
import CommunityFeed from "@/components/CommunityFeed";

export default function UserCommunityPage() {
  return (
    <UserShell>
      <div className="py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Community Feed</h1>
          <p className="text-slate-400 mt-2">Connect with other athletes and trainers. Share your journey.</p>
        </div>
        <CommunityFeed />
      </div>
    </UserShell>
  );
}
