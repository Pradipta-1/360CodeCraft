"use client";

import OrganizerShell from "@/components/OrganizerShell";
import CommunityFeed from "@/components/CommunityFeed";

export default function OrganizerCommunityPage() {
  return (
    <OrganizerShell>
      <div className="py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Event Community</h1>
          <p className="text-slate-400 mt-2">Stay updated with what participants and trainers are sharing.</p>
        </div>
        <CommunityFeed />
      </div>
    </OrganizerShell>
  );
}
