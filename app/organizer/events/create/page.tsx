"use client";

import { FormEvent, useState } from "react";

export default function OrganizerCreateEventPage() {
  const [title, setTitle] = useState("");
  const [sportType, setSportType] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [limit, setLimit] = useState(50);
  const [description, setDescription] = useState("");
  const [openToTrainers, setOpenToTrainers] = useState(false);
  const [trainersNeeded, setTrainersNeeded] = useState(0);
  const [trainerConditions, setTrainerConditions] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        sportType,
        location,
        date,
        time,
        participantLimit: limit,
        description,
        openToTrainers,
        trainersNeeded: openToTrainers ? trainersNeeded : undefined,
        trainerConditions: openToTrainers ? trainerConditions : undefined
      })
    });
    const data = await res.json();
    if (data.success) {
      setMessage("Event created and pending admin approval.");
      setTitle("");
      setSportType("");
      setLocation("");
      setDate("");
      setTime("");
      setDescription("");
      setOpenToTrainers(false);
      setTrainersNeeded(0);
      setTrainerConditions("");
    } else {
      setMessage(data.error || "Failed to create event");
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-50">Create Event</h1>
      <form onSubmit={handleSubmit} className="space-y-3 text-sm">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-xs text-slate-300">Event Title</label>
            <input
              className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-slate-300">Sport Type</label>
            <input
              className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
              value={sportType}
              onChange={e => setSportType(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-slate-300">Location</label>
            <input
              className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
              value={location}
              onChange={e => setLocation(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-slate-300">Date</label>
              <input
                type="date"
                className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-slate-300">Time</label>
              <input
                type="time"
                className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
                value={time}
                onChange={e => setTime(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-300">Participant Limit</label>
            <input
              type="number"
              min={1}
              className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
              value={limit}
              onChange={e => setLimit(Number(e.target.value))}
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-300">Event Description</label>
          <textarea
            className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="inline-flex items-center gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={openToTrainers}
              onChange={e => setOpenToTrainers(e.target.checked)}
            />
            Open to Trainers
          </label>
          {openToTrainers && (
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-xs text-slate-300">Trainers Needed</label>
                <input
                  type="number"
                  min={1}
                  className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
                  value={trainersNeeded}
                  onChange={e => setTrainersNeeded(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300">Conditions for Trainers</label>
                <input
                  className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1"
                  value={trainerConditions}
                  onChange={e => setTrainerConditions(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
        {message && <p className="text-xs text-slate-300">{message}</p>}
        <button
          type="submit"
          className="rounded bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950"
        >
          Create Event
        </button>
      </form>
    </div>
  );
}

