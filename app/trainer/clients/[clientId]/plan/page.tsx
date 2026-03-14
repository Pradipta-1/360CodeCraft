"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Params = {
  clientId: string;
};

export default function TrainerClientPlanPage() {
  const { clientId } = useParams<Params>();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/workout-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          clientId,
          title: title.trim(),
          description: description.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save workout plan");
      }

      router.push("/trainer/clients");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save workout plan");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="client-plan" className="tab-pane">
      <div className="card">
        <h1 className="card-title">Create Workout Plan</h1>
        <p className="card-subtitle">
          Compose a workout plan tailored to this client. They will see the latest plan on their
          dashboard.
        </p>
      </div>

      <div className="card">
        {error && (
          <p className="mb-4 text-sm text-red-400">
            {error}
          </p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-100">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:border-[#00c896] focus:outline-none"
              placeholder="e.g. 4-Week Strength Program"
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-100">
              Plan details
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[160px] w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:border-[#00c896] focus:outline-none"
              placeholder="Describe exercises, sets, reps, and weekly schedule…"
              disabled={submitting}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800/70"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim() || !description.trim()}
              className="rounded-lg bg-[#00c896] px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-[#00a87a] disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Save Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

