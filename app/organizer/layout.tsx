import type { ReactNode } from "react";
import Link from "next/link";

export default function OrganizerLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-6">
        <aside className="w-60 space-y-2 text-sm">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Organizer
          </p>
          <nav className="space-y-1">
            <Link href="/organizer/dashboard" className="block rounded px-3 py-1 hover:bg-slate-900">
              Dashboard
            </Link>
            <Link
              href="/organizer/events/create"
              className="block rounded px-3 py-1 hover:bg-slate-900"
            >
              Create Event
            </Link>
            <Link
              href="/organizer/events/manage"
              className="block rounded px-3 py-1 hover:bg-slate-900"
            >
              Manage Events
            </Link>
            <Link href="/organizer/trainers" className="block rounded px-3 py-1 hover:bg-slate-900">
              Trainers
            </Link>
            <Link
              href="/organizer/participants"
              className="block rounded px-3 py-1 hover:bg-slate-900"
            >
              Participants
            </Link>
            <Link href="/organizer/messages" className="block rounded px-3 py-1 hover:bg-slate-900">
              Messages
            </Link>
          </nav>
        </aside>
        <section className="flex-1">{children}</section>
      </div>
    </main>
  );
}

