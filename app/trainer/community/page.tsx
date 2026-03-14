"use client";

import TrainerShell from "@/components/TrainerShell";
import CommunityFeed from "@/components/CommunityFeed";

export default function TrainerCommunityPage() {
  return (
    <TrainerShell>
      <div className="py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Trainer Community Explorer</h1>
          <p className="text-slate-400 mt-2">Share your expertise, post workouts, and engage with the community.</p>
        </div>
        <CommunityFeed />
      </div>
    </TrainerShell>
  );
}
